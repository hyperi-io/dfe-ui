import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandCakephp = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-cakephp" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m12 11 8 2c1.361-.545 2-1.248 2-2V7.2C22 5.435 17.521 4 11.998 4 6.476 4 2 5.435 2 7.2V10c0 1.766 4.478 4 10 4zM12 14v3l8 2c1.362-.547 2-1.246 2-2v-3c0 .754-.638 1.453-2 2zM2 17c0 1.766 4.476 3 9.998 3L12 17c-5.522 0-10-1.734-10-3.5zM2 10v4M22 10v4" /></svg>;
const Memo = memo(IconBrandCakephp);
export default Memo;