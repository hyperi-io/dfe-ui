import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGuitarPickFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-guitar-pick" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 2c-1.613 0-2.882.104-3.825.323l-.23.057C4.926 3.088 3 4.883 3 8c0 3.367 1.939 8.274 4.22 11.125q.48.6 1.03 1.158l.367.36a4.904 4.904 0 0 0 6.752.011 15 15 0 0 0 1.41-1.528C19.27 16.013 21 11.832 21 8c0-3.025-1.813-4.806-4.71-5.562l-.266-.066C15.088 2.122 13.743 2 12 2" /></svg>;
const Memo = memo(IconGuitarPickFilled);
export default Memo;