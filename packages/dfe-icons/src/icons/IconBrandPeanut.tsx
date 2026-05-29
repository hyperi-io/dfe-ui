import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandPeanut = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-peanut" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m15 16.25-.816-.36-.462-.196c-1.444-.592-2-.593-3.447 0l-.462.195-.817.359a4.5 4.5 0 1 1 0-8.49l1.054.462.434.178c1.292.507 1.863.48 3.237-.082l.462-.195.817-.359a4.5 4.5 0 1 1 0 8.49" /></svg>;
const Memo = memo(IconBrandPeanut);
export default Memo;