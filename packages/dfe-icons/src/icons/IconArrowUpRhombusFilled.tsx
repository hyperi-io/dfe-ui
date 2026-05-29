import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArrowUpRhombusFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-arrow-up-rhombus" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m12 2 .081.003.12.017.111.03.111.044.098.052.104.074.082.073 3 3a1 1 0 1 1-1.414 1.414L13 5.415v10.17l2.207 2.208a1 1 0 0 1 0 1.414l-2.5 2.5a1 1 0 0 1-1.414 0l-2.5-2.5a1 1 0 0 1 0-1.414L11 15.584V5.415L9.707 6.707a1 1 0 0 1-1.32.083l-.094-.083a1 1 0 0 1 0-1.414l3-3 .112-.097.11-.071.062-.031.081-.034.076-.024.118-.025.058-.007z" /></svg>;
const Memo = memo(IconArrowUpRhombusFilled);
export default Memo;