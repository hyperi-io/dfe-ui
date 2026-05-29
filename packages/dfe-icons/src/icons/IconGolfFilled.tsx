import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGolfFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-golf" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M11 3a1 1 0 0 1 1.496-.868l7 4a1 1 0 0 1 0 1.736L13 11.58V18a1 1 0 0 1-.883.993L12 19a1 1 0 0 1-1-1z" /><path d="M14.135 17.168a1 1 0 0 1 1.367-.363C16.418 17.337 17 18.096 17 19c0 1.84-2.319 3-5 3s-5-1.16-5-3c0-.911.577-1.66 1.498-2.195a1 1 0 1 1 1.004 1.73c-.365.212-.502.39-.502.465 0 .086.179.296.622.518.6.3 1.456.482 2.378.482s1.777-.182 2.378-.482c.443-.222.622-.432.622-.518 0-.07-.142-.256-.502-.465a1 1 0 0 1-.363-1.367" /></svg>;
const Memo = memo(IconGolfFilled);
export default Memo;