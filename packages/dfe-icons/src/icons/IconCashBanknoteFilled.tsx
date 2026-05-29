import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCashBanknoteFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-cash-banknote" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zm-7 4a3 3 0 0 0-2.996 2.85L9 12a3 3 0 1 0 3-3m6.01 2H18a1 1 0 0 0 0 2h.01a1 1 0 0 0 0-2m-12 0H6a1 1 0 1 0 .01 2 1 1 0 0 0 0-2" /></svg>;
const Memo = memo(IconCashBanknoteFilled);
export default Memo;