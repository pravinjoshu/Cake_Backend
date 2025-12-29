import mongoose  from "mongoose"

const bannerSchema = new mongoose.Schema({
  bannerName:{
    type:String,
    required:true
  },
  image: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default  mongoose.model("Banner", bannerSchema);
