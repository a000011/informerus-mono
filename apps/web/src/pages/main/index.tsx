import { FC } from "react";
import { trpc } from "../../trpc/server";

export const MainPage: FC = () => {
	const {} = trpc.useQueries(({images}) => )
  return <div> Hello </div>;
};
