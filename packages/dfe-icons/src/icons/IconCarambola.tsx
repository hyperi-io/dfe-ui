import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCarambola = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-carambola" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M17.286 21.09q-1.69.001-5.288-2.615-3.596 2.617-5.288 2.616-2.726 0-.495-6.8-9.389-6.775 2.135-6.775h.076Q10.211 2 12 2q1.785 0 3.574 5.516h.076q11.525 0 2.133 6.774 2.23 6.802-.497 6.8" /></svg>;
const Memo = memo(IconCarambola);
export default Memo;