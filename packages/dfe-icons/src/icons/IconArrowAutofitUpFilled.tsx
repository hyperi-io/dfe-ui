import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArrowAutofitUpFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-arrow-autofit-up" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M14 21a1 1 0 0 0 1-1V8.999h-.092a3 3 0 0 1-2.03-5.12.515.515 0 0 0-.363-.879H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3z" /><path d="M18 21a1 1 0 0 0 1-1V5.416l1.293 1.291a1 1 0 0 0 1.32.083l.094-.083a1 1 0 0 0 0-1.414l-3-3a1 1 0 0 0-.112-.097l-.11-.071-.114-.054-.105-.035-.149-.03L18 2l-.075.003-.126.017-.111.03-.111.044-.098.052-.096.067-.09.08-3 3a1 1 0 1 0 1.414 1.414L17 5.414V20a1 1 0 0 0 1 1" /></svg>;
const Memo = memo(IconArrowAutofitUpFilled);
export default Memo;