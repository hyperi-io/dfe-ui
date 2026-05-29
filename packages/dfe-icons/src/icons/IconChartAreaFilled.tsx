import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChartAreaFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-chart-area" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M20 18a1 1 0 0 1 .117 1.993L20 20H4a1 1 0 0 1-.117-1.993L4 18zM15.22 5.375a1 1 0 0 1 1.393-.165l.094.083 4 4a1 1 0 0 1 .284.576L21 10v5a1 1 0 0 1-.883.993L20 16H3.978l-.11-.009-.11-.02-.107-.034-.105-.046-.1-.059-.094-.07-.06-.055-.072-.082-.064-.089-.054-.096-.016-.035-.04-.103-.027-.106-.015-.108-.004-.11.009-.11.019-.105q.015-.06.035-.112l.046-.105.059-.1 4-6a1 1 0 0 1 1.165-.39l.114.05 3.277 1.638z" /></svg>;
const Memo = memo(IconChartAreaFilled);
export default Memo;