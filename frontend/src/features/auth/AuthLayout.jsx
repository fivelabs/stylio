import { Link } from "react-router-dom";
import { useTenant } from "@/app/TenantProvider";

export default function AuthLayout({ children }) {
  const { tenant, preferences } = useTenant();
  const brandName = preferences?.visible_name || tenant?.name || "Stylio";
  const bannerVertical = preferences?.banner_vertical_url;

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />

      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-accent">
          {bannerVertical ? (
            <>
              <img
                src={bannerVertical}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 z-10 p-12">
                <p className="text-white/80 text-sm drop-shadow-md">© {new Date().getFullYear()} {brandName}</p>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-accent to-accent/95" />
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80"
                alt=""
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
              />
              <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                <Link
                  to="/"
                  className="font-heading font-bold text-2xl text-white tracking-tight"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {brandName}
                </Link>
                <div className="mb-20">
                  <h1 className="font-heading text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-6">
                    Tu salón merece<br />la mejor tecnología.
                  </h1>
                  <p className="text-white/60 text-lg max-w-sm leading-relaxed">
                    Gestiona citas, clientes y equipo desde una sola plataforma diseñada para profesionales de la belleza.
                  </p>
                </div>
                <p className="text-white/30 text-sm">© {new Date().getFullYear()} Stylio</p>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-canvas">
          <div className="w-full max-w-[420px]">
            <Link
              to="/"
              className="lg:hidden block font-heading font-bold text-2xl text-accent tracking-tight mb-10"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {brandName}
            </Link>

            {children}
          </div>
        </div>
      </div>
    </>
  );
}
