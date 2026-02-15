import OpenAI from "openai";
import dotenv from "dotenv";
import Product from "../models/product.js";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT: Change from null to empty array
let lastCakeShown = null;

export const chatBot = async (req, res) => {
  console.log("Last cake shown:", lastCakeShown);

  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "input required" });
    }

    const text = input.toLowerCase().trim();

    // Check if user is confirming order
    const confirmWords = ["yes", "ok", "okay", "sure", "order", "place order", "confirm"];
    const isConfirming = confirmWords.some(word => text.includes(word));

    if (isConfirming && lastCakeShown && lastCakeShown.length > 0) {

      let selectedCake;

      if (lastCakeShown.length === 1) {
        selectedCake = lastCakeShown[0];
      } else {
        // Check if user mentioned a number (1, 2, 3, etc.)
        const numberMatch = text.match(/(\d+)/);
        if (numberMatch) {
          const index = parseInt(numberMatch[1]) - 1;
          if (index >= 0 && index < lastCakeShown.length) {
            selectedCake = lastCakeShown[index];
          }
        }

        // If no number, check if they mentioned a cake name
        if (!selectedCake) {
          for (const cake of lastCakeShown) {
            if (text.includes(cake.cakeName.toLowerCase())) {
              selectedCake = cake;
              break;
            }
          }
        }

        // If still not found, default to first cake
        if (!selectedCake) {
          selectedCake = lastCakeShown[0];
        }
      }

      // Generate order confirmation with proper formatting
      const ai = await client.responses.create({
        model: "gpt-5-nano",
        instructions: `
Write a SHORT confirmation message in this EXACT format:

"Great! 🎂

[Cake Name] - ₹[Price]

Click here to order: BuyNow"

Do NOT add extra text. Keep it simple and direct.
`,
        input: `
Cake name: ${selectedCake.cakeName}
Price: ₹${selectedCake.price}
`
      });

      // Clear lastCakeShown after order
      lastCakeShown = null;

      return res.json({
        message: ai.output_text,
        products: [selectedCake],
        orderLink: `http://localhost:5173/buypage/${selectedCake._id}`,
        showBuyButton: true  // Flag to show buy button in frontend
      });
    }

    /* STEP 1: Extract intent */
    const intentAI = await client.responses.create({
      model: "gpt-5-nano",
      instructions: `
Classify the user message and extract values.

Return JSON only:

{
 "intent": "general | cakeName | flavour | namePrice | price | priceRange | lowerprice | designCake | designPrice | kg",
 "cakeName": "",
 "flavor": "",
 "price": null,
 "price_min": null,
 "price_max": null,
 "weight": ""
}

Rules:
- "cake" or "cakes" or "show cakes" → intent = "general" (show all products)
- "truffle" or "choco truffle" or "chocolate truffle" → intent = "cakeName", cakeName = "truffle" (or the specific name mentioned)
- "black forest" → intent = "cakeName", cakeName = "black forest"
- "chocolate cake" → intent = "flavour", flavor = "chocolate"
- "chocolate cake price" → intent = "namePrice", cakeName = "chocolate cake"
- "cake 500" → intent = "price", price = 500
- "cake 400 to 1000" → intent = "priceRange", price_min = 400, price_max = 1000
- "lower price cake" → intent = "lowerprice"
- "design cake" or "design" or "designer cake" or "show design cakes" → intent = "designCake"
- "design cake price" or "designer cake price" → intent = "designPrice"
- "2kg cake" → intent = "kg", weight = "2kg"

Important:
- If user says ONLY "cake" or "cakes" without any specific name/flavor, set intent = "general"
- If user mentions ANY specific cake name or partial name (like "truffle", "choco", "forest"), set intent = "cakeName" and extract that name
- For partial names, extract the exact words user mentioned (e.g., "choco truffle" → cakeName = "choco truffle")
- If the user mentions both cake name and price (example: "chocolate cake 500"), set intent = "namePrice" and fill both cakeName and price.
- If the user mentions cake name and lower price (example: "chocolate cake lower price"), set intent = "lowerprice" and also fill cakeName.
- Always fill any detected values even if multiple appear.
Return JSON only.
`,
      input
    });

    let intentData = {};
    try {
      intentData = JSON.parse(intentAI.output_text);
      console.log("Extracted intent data:", intentData);
    } catch (parseError) {
      console.error("Intent parsing error:", parseError);
    }

    /* STEP 2: Build DB query */
    let query = {};
    let sort = {};

    /* General cake query - show all products */
    if (intentData.intent === "general") {
      // No specific filters, will show all cakes
      query = {};
    }

    /* cake name filter - enhanced for partial matching */
    if (intentData.cakeName) {
      // Split search term into words for better partial matching
      const searchWords = intentData.cakeName.toLowerCase().split(/\s+/).filter(word => word.length > 0);

      if (searchWords.length > 0) {
        // Create a regex pattern that matches any of the search words
        // This allows "truffle" to match "Chocolate Truffle Cake"
        // And "choco truffle" to match "Chocolate Truffle"
        const regexPattern = searchWords.map(word => `(?=.*${word})`).join('');
        query.cakeName = { $regex: regexPattern, $options: "i" };
      }
    }

    /* flavour filter */
    if (intentData.flavor) {
      query.flavor = { $regex: intentData.flavor, $options: "i" };
    }

    /* exact price */
    if (intentData.price) {
      query.price = intentData.price;
    }

    /* price range */
    if (intentData.price_min || intentData.price_max) {
      query.price = {
        ...(intentData.price_min ? { $gte: intentData.price_min } : {}),
        ...(intentData.price_max ? { $lte: intentData.price_max } : {})
      };
    }

    /* lower price sorting */
    if (intentData.intent === "lowerprice") {
      sort.price = 1;
    }

    /* design category - category is an array in schema */
    if (intentData.intent === "designCake" || intentData.intent === "designPrice") {
      // Using regex for case-insensitive matching on array field
      query.category = { $regex: "design", $options: "i" };
    }

    /* weight filter */
    if (intentData.weight) {
      query.weight = intentData.weight;
    }

    /* STEP 3: DB search */
    const cakes = await Product.find(query)
      .sort(sort)
      .limit(10)
      .select("cakeName price flavor weight images");

    console.log("Found cakes:", cakes.length);

    /* STEP 4: AI formats response */
    if (cakes.length > 0) {
      // FIX 3: Store the array of cakes
      lastCakeShown = cakes;

      const ai = await client.responses.create({
        model: "gpt-5-nano",
        instructions: `
Using ONLY the provided cake list, write a friendly assistant reply that:

1. If user asked for general "cake" or "cakes", say something like:
   "Here are our available cakes:"
2. If user searched for a specific name (like "truffle" or "chocolate"), say something like:
   "I found these cakes matching your search:"
3. If user asked for "design cake" or "designer cake", say something like:
   "Here are our design cakes:"
4. Show the cake list ONLY ONCE (do NOT repeat the list).
5. After listing, ask in one line:
   "Which cake would you like to order?"
6. If only one cake is found, ask:
   "Would you like to order this cake?"
7. Do NOT add another "Available cakes" section.
8. Do NOT invent cakes.
Keep the reply short, clear, and friendly.
`,
        input: `
User message: ${input}

Cake list:
${cakes.map((c, i) => `${i + 1}. ${c.cakeName} - ₹${c.price}${c.flavor ? ` (${c.flavor})` : ''}${c.weight ? ` [${c.weight}]` : ''}`).join("\n")}
`
      });

      return res.json({
        message: ai.output_text,
        products: cakes
      });
    }

    // No cakes found
    lastCakeShown = null;

    return res.json({
      message: "Sorry, no matching cakes found. Please try another search.",
      products: []
    });

  } catch (error) {
    console.error("CHATBOT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};