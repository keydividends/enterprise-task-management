const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Enforce uppercase like TASK_VIEW
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    module: {
      type: String,
      enum: [
        "AUTH",
        "USER",
        "ROLE",
        "PROJECT",
        "TEAM",
        "TASK",
        "SPRINT",
        "DASHBOARD",
        "REPORT",
        "NOTIFICATION",
        "ATTACHMENT",
        "COMMENT",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["VIEW", "CREATE", "UPDATE", "DELETE", "MANAGE"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

permissionSchema.index({ module: 1 });
permissionSchema.index({ isActive: 1 });

module.exports = mongoose.model("Permission", permissionSchema);
