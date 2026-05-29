import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBinaryTree2Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-binary-tree-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 3a3 3 0 0 1 2.616 4.47l3.274 3.742a3 3 0 1 1-1.505 1.318L13.11 8.787l-.11.042v6.342a3.001 3.001 0 1 1-2 0V8.829l-.111-.041-3.274 3.742a3 3 0 1 1-1.505-1.318L9.383 7.47A3 3 0 0 1 12 3" /></svg>;
const Memo = memo(IconBinaryTree2Filled);
export default Memo;