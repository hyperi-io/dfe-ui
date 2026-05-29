import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandLivewire = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-livewire" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M20.982 18.777C20.61 19.325 20.33 20 19.576 20c-1.269 0-1.337-1.913-2.607-1.913S15.769 20 14.499 20c-1.268 0-1.337-1.913-2.607-1.913-1.269 0-1.2 1.913-2.47 1.913-1.268 0-1.337-1.913-2.607-1.913S5.615 20 4.345 20c-.398 0-.679-.189-.915-.448A10.4 10.4 0 0 1 2 14.262C2 8.593 6.477 4 12 4c5.524 0 10 4.594 10 10.261 0 1.62-.366 3.152-1.018 4.516" /><path d="M20.982 18.777C20.61 19.325 20.33 20 19.576 20c-1.269 0-1.337-1.913-2.607-1.913S15.769 20 14.499 20c-1.268 0-1.337-1.913-2.607-1.913-1.269 0-1.2 1.913-2.47 1.913-1.268 0-1.337-1.913-2.607-1.913S5.615 20 4.345 20c-.398 0-.679-.189-.915-.448A10.4 10.4 0 0 1 2 14.262C2 8.593 6.477 4 12 4c5.524 0 10 4.594 10 10.261 0 1.62-.366 3.152-1.018 4.516" /><path d="M11.5 16c3.167 0 4.5-1.748 4.5-4.231C16 9.285 13.986 7 11.5 7 9.015 7 7 9.286 7 11.769S8.333 16 11.5 16" /><path d="M10 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2" /></svg>;
const Memo = memo(IconBrandLivewire);
export default Memo;