import { HelmetProvider, Helmet } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildPageTitle } from "@/lib/site-meta";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const { getSetting } = useSiteSettings();
  const siteName = getSetting("site_name", "Vertex Cars");

  return (
    <Helmet>
      <title>{buildPageTitle(title, siteName)}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </HelmetProvider>
);

export default PageMeta;
