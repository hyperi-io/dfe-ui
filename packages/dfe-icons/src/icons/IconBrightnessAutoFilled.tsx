import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrightnessAutoFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-brightness-auto" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12.707 2.793 14.915 5H18a1 1 0 0 1 .993.883L19 6v3.085l2.207 2.208a1 1 0 0 1 .083 1.32l-.083.094L19 14.914V18a1 1 0 0 1-.883.993L18 19h-3.086l-2.207 2.207a1 1 0 0 1-1.32.083l-.094-.083L9.085 19H6a1 1 0 0 1-.993-.883L5 18v-3.085l-2.207-2.208a1 1 0 0 1-.083-1.32l.083-.094L5 9.084V6a1 1 0 0 1 .883-.993L6 5h3.084l2.209-2.207a1 1 0 0 1 1.414 0M12 8a3 3 0 0 0-3 3v3.5a1 1 0 0 0 2 0V14h2v.5a1 1 0 0 0 .883.993L14 15.5a1 1 0 0 0 1-1V11a3 3 0 0 0-3-3m0 2a1 1 0 0 1 1 1v1h-2v-1a1 1 0 0 1 .883-.993z" /></svg>;
const Memo = memo(IconBrightnessAutoFilled);
export default Memo;