import { strapi } from "@strapi/client";
import { ENV } from "@informerus/validators";
import type { FilesType } from "../index.js";

const client = strapi({
  baseURL: `${ENV.strapi.host}/api`,
  auth: ENV.strapi.token,
});

type AdressesType = {
  data: {
    documentId: string;
    Address: string;
  }[];
};

const strapiModels = {
  filial: {
    endpoint: "/filialies",
    model: "filialies",
  },

  marks: {
    endpoint: "/otzyvies",
    model: "otzyvies",
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

type FetchMediaResponseType = {
  data: {
    Media?: {
      url: string;
    }[];
  };
};

export const fetchDocumentMedia = async (
  documentID: string,
): Promise<
  {
    url: string;
  }[]
> => {
  try {
    const res = (await (
      await client.fetch(
        `/${strapiModels.marks.model}/${documentID}?populate=*`,
      )
    ).json()) as FetchMediaResponseType;

    // const media = res.data.media_files;

    if (!res.data.Media) {
      return [];
    }

    return res.data.Media;
  } catch (e) {
    console.log(e);

    throw Error("Error request");
  }
};

export const uploadReview = async (data: {
  filial: string;
  userName: string;
  publickName: string;
  content: string;
  mark: number;
  pendingGroupId: string;
  files: FilesType;
}): Promise<string> => {
  let documentId = "";

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
    documentId = (
      await client.collection(strapiModels.marks.model).create({
        Mark: data.mark,
        Branche: data.filial,
        Content: data.content,
        Media: fileIds,
        FIO: data.publickName,
        Username: data.userName,
      })
    ).data.documentId;
  } catch (e) {
    console.log(e);

    throw Error("Error request");
  }

  return documentId;
};
