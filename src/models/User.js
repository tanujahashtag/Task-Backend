const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true },
    designation: { type: String },
    username: { type: String, unique: true },
    role: { type: String, default: "Employee" },
    profileImage: { type: String, default: "default-avatar.png" },
    project: [
      {
        project_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

module.exports = mongoose.model("User", UserSchema);
