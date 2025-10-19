import { FilesType } from "..";
import { uploadReview } from "../strapi/index.js";

export const submitReview = async (data: {
  filial: string;
  content: string;
  mark: number;
  pendingGroupId: string;
  files: FilesType;
}) => {
  console.log(JSON.stringify(data));

  await uploadReview(data);
};
