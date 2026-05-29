import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHotelService = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-hotel-service" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8.5 10A1.5 1.5 0 0 1 7 8.5a5.5 5.5 0 0 1 11 0V19a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2c0-1.38.71-2.444 1.88-3.175l4.424-2.765C14.359 10.4 15 9.744 15 8.5a2.5 2.5 0 1 0-5 0A1.5 1.5 0 0 1 8.5 10" /></svg>;
const Memo = memo(IconHotelService);
export default Memo;