import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandFeedly = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-feedly" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m7.833 12.278 4.445-4.445M10.055 14.5l2.223-2.222M12.278 16.722l.555-.555M19.828 14.828a4 4 0 0 0 0-5.656l-5-5a4 4 0 0 0-5.656 0l-5 5a4 4 0 0 0 0 5.656L10.343 21h3.314z" /></svg>;
const Memo = memo(IconBrandFeedly);
export default Memo;