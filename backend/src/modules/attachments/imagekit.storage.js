const path = require("path");
const crypto = require("node:crypto");

const hasValue = (value) => Boolean(String(value || "").trim());

const isImageKitConfigured = () => (
  hasValue(process.env.IMAGEKIT_ENDPOINT)
  && hasValue(process.env.IMAGEKIT_PUBLICKEY)
  && hasValue(process.env.IMAGEKIT_PRIVATEKEY)
);

const getClient = () => {
  if (!isImageKitConfigured()) return null;

  const ImageKit = require("imagekit");
  return new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLICKEY,
    privateKey: process.env.IMAGEKIT_PRIVATEKEY,
  });
};

const createRemoteFileName = (originalName = "attachment") => {
  const extension = path.extname(originalName).toLowerCase();
  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
};

const uploadToImageKit = async (file) => {
  const client = getClient();
  if (!client) throw new Error("ImageKit storage is not configured.");

  const result = await client.upload({
    file: file.buffer,
    fileName: createRemoteFileName(file.originalname),
    folder: process.env.IMAGEKIT_ATTACHMENT_FOLDER || "/enterprise-task-management/attachments",
    useUniqueFileName: false,
  });

  return {
    fileId: result.fileId,
    fileName: result.name,
    url: result.url,
  };
};

const deleteFromImageKit = async (fileId) => {
  if (!fileId || !isImageKitConfigured()) return;
  const client = getClient();
  await client.deleteFile(fileId);
};

module.exports = {
  isImageKitConfigured,
  uploadToImageKit,
  deleteFromImageKit,
};
