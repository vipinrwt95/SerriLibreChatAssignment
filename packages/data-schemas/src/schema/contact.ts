import { Schema } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      trim: true,
      index: true, 
    },

    notes: {
      type: String,
    },

 
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },

    search_text: {
      type: String,
      default: '',
      index:true}
},
  {
    timestamps: true, 
  }
);

export default contactSchema;