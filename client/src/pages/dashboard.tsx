import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { RiDonutChartLine } from "react-icons/ri";

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <RiDonutChartLine className="text-3xl text-primary" />
            <h1 className={title()}>Dashboard</h1>
          </div>
          <div className={subtitle({ class: "mt-4" })}>
            Vista general de tu negocio
          </div>
        </div>

        <div className="max-w-4xl w-full px-4">
          <div className="bg-content1 border border-default-200 rounded-lg p-8 text-center">
            <p className="text-default-500">
              Aquí se mostrarán las estadísticas y métricas importantes de tu negocio.
            </p>
            <p className="text-sm text-default-400 mt-2">
              Contenido del dashboard en desarrollo...
            </p>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
} 