import { strapi } from "@strapi/client";
import { ENV } from "@informerus/validators";
import { FilesType } from "../index.js";

const client = strapi({
  baseURL: `${ENV.strapi.host}/api`,
  auth: ENV.strapi.token,
});

type AdressesType = {
  data: {
    documentId: string;
    adress: string;
  }[];
};

const strapiModels = {
  filial: {
    endpoint: "/bakery-filials",
  },
};

export const fetchAdresses = async (): Promise<AdressesType> => {
  let res;
  try {
    res = await client.fetch(strapiModels.filial.endpoint);

    return (await res.json()) as AdressesType;
  } catch (e) {
    console.log(e);

    throw Error("Error request");
  }
};

export const uploadReview = async (data: {
  filial: string;
  content: string;
  mark: number;
  pendingGroupId: string;
  files: FilesType;
}): Promise<void> => {
  try {
    const fileIds: number[] = [];
    await Promise.all(
      data.files.map(async (file) => {
        const response = await fetch(file.filePath);
        const fileBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        const formData = new FormData();

        const blob = new Blob([buffer], {
          type: file.mime_type,
        });
        formData.append("file", blob, file.fileName);

        const res = await client.files.upload(blob, {
          fileInfo: { alternativeText: "An example image" },
        });
        //@ts-ignore asd
        fileIds.push(res[0].id);
      }),
    );
    await client.collection("marks").create({
      mark: data.mark,
      media_files: fileIds,
      content: data.content,
      filial: data.filial,
    });
  } catch (e) {
    console.log(e);

    throw Error("Error request");
  }
};
