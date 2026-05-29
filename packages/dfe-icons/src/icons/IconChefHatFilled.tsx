import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChefHatFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-chef-hat" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 19.002V21a1 1 0 0 1-.883.993L18 22H6a1 1 0 0 1-1-1v-1.994a1 1 0 0 1 1-1l12-.004a1 1 0 0 1 1 1M12 2a5 5 0 0 1 4.533 2.888l.06.137.136-.009a5 5 0 0 1 4.99 3.477l.063.213a5 5 0 0 1-2.696 5.831l-.087.037v1.428a1 1 0 0 1-1 1l-12 .004a1 1 0 0 1-.993-.883l-.007-.117v-1.433l-.123-.055a5 5 0 0 1-2.6-3.001l-.064-.223a5 5 0 0 1 5.193-6.27l.066-.142a5 5 0 0 1 4.302-2.877z" /></svg>;
const Memo = memo(IconChefHatFilled);
export default Memo;