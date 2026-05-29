import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAlphabetThai = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-alphabet-thai" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 18v-3.444c0-.49.165-.924.494-1.363.326-.449 1.009-.76 1.506-.934.032-.011.035-.079.004-.095-.434-.22-1.294-.52-1.626-1.032l-.014-.021-.083-.125C8 10.566 8 9.74 8 9.74c0-1.456.849-2.62 1.837-3.199q.9-.54 2.137-.541 1.077 0 1.995.47C15.297 7.117 16 8.672 16 10.446V18" /></svg>;
const Memo = memo(IconAlphabetThai);
export default Memo;