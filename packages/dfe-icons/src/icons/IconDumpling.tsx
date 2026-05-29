import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDumpling = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-dumpling" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5.532 5.532a2.53 2.53 0 0 1 2.56-.623 2.532 2.532 0 0 1 4.604-.717q.146-.24.356-.45a2.532 2.532 0 0 1 4.318 1.637 2.53 2.53 0 0 1 2.844.511l.358.358c1.384 1.385-.7 5.713-4.655 9.669-3.956 3.955-8.284 6.04-9.669 4.655l-.358-.358-.114-.122a2.53 2.53 0 0 1-.398-2.724 2.532 2.532 0 0 1-1.186-4.675A2.532 2.532 0 0 1 4.91 8.09a2.53 2.53 0 0 1 .622-2.558" /></svg>;
const Memo = memo(IconDumpling);
export default Memo;