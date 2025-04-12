import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["mentor", "mentee"], required: true },
    field: { type: String, required: function() { return this.role === "mentor"; } },
    otherField: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    experience: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash.replace(/^\$2a\$/, '$2b$');
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const normalizedHash = this.password.replace(/^\$2a\$/, '$2b$');
    return await bcrypt.compare(candidatePassword, normalizedHash);
  } catch (error) {
    return false;
  }
};

const User = mongoose.model("User", userSchema);
export default User;
