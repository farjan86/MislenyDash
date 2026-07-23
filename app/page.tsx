import QuickTiles from "@/components/QuickTiles";
import TodayHero from "@/components/TodayHero";
import WeatherCard from "@/components/WeatherCard";
import AirCard from "@/components/AirCard";
import RadarMap from "@/components/RadarMap";
import WeatherAlertCard from "@/components/WeatherAlertCard";
import WasteCard from "@/components/WasteCard";
import OutageCard from "@/components/OutageCard";
import OfficeCard from "@/components/OfficeCard";
import InstitutionsSection from "@/components/InstitutionsSection";
import NewsCard from "@/components/NewsCard";
import DoctorGroupCard from "@/components/DoctorGroupCard";
import PharmacyCard from "@/components/PharmacyCard";
import VetCard from "@/components/VetCard";
import VedonoCard from "@/components/VedonoCard";
import UgyeletCard from "@/components/UgyeletCard";
import FootballCard from "@/components/FootballCard";
import HandballCard from "@/components/HandballCard";
import BasketballCard from "@/components/BasketballCard";
import VisitorCounter from "@/components/VisitorCounter";

function ZoneHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="zone-head">
      <span className="zone-eyebrow">{eyebrow}</span>
      <h2 className="zone-title">{title}</h2>
    </div>
  );
}

export default function Home() {
  return (
    <div className="page" id="top">
      <header className="masthead">
        <div className="wrap">
          <p className="kicker">Kozármisleny · élő városi adat</p>
          <h1>MislenyMa</h1>
          <p className="sub">
            A város élő adatai egy helyen — időjárás, hulladéknaptár, áramszünet,
            orvos és minden, ami helyben mindennap számít.
          </p>
        </div>
      </header>

      <QuickTiles />

      <div className="wrap">
        <section className="zone" id="ma">
          <ZoneHead eyebrow="Ma" title="Amit ma tudni érdemes" />
          <TodayHero />
        </section>

        <section className="zone" id="idojaras">
          <ZoneHead eyebrow="Időjárás" title="Időjárás élőben" />
          <div className="dash solo">
            <WeatherAlertCard />
          </div>
          <div className="wx-panel">
            <div className="wx-panel-col">
              <WeatherCard />
              <AirCard />
            </div>
            <RadarMap />
          </div>
        </section>

        <section className="zone" id="hulladek">
          <ZoneHead eyebrow="Hulladék" title="Szállítás és naptár" />
          <div className="dash solo">
            <WasteCard />
          </div>
        </section>

        <section className="zone" id="kozmu">
          <ZoneHead eyebrow="Közmű" title="Áram, gáz, szolgáltatás" />
          <div className="dash solo">
            <OutageCard />
          </div>
        </section>

        <section className="zone" id="hivatal">
          <ZoneHead eyebrow="Önkormányzat" title="Hivatal és ügyfélfogadás" />
          <div className="dash solo">
            <OfficeCard />
          </div>
        </section>

        <section className="zone" id="intezmenyek">
          <ZoneHead eyebrow="A város" title="Intézmények" />
          <InstitutionsSection />
        </section>

        <section className="zone" id="egeszseg">
          <ZoneHead eyebrow="Egészségügy" title="Orvos, gyógyszertár, védőnő" />
          <div className="dash solo">
            <UgyeletCard />
          </div>
          <div className="dash grid">
            <DoctorGroupCard group="gp" />
            <DoctorGroupCard group="pediatric" />
            <DoctorGroupCard group="dentist" />
            <PharmacyCard />
            <VetCard />
          </div>
          <div className="dash solo">
            <VedonoCard />
          </div>
        </section>

        <section className="zone" id="sport">
          <ZoneHead eyebrow="Sport" title="SE Kozármisleny" />
          <div className="dash grid">
            <FootballCard />
            <HandballCard />
            <BasketballCard />
          </div>
        </section>

        <section className="zone" id="hirek">
          <ZoneHead eyebrow="A város" title="Helyi és megyei hírek" />
          <div className="dash solo">
            <NewsCard />
          </div>
        </section>

        <footer className="site-foot">
          <span>MislenyMa · közösségi adat-dashboard</span>
          <VisitorCounter />
          <span>Kozármisleny, ~6 900 fő</span>
        </footer>
      </div>
    </div>
  );
}
