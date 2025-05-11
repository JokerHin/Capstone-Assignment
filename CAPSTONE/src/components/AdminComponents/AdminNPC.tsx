import React from "react";
import Grand from "../../assets/npc/GrandCompiler.png";
import Auntie from "../../assets/npc/AuntieAng.png";
import Uncle from "../../assets/npc/UncleChong.png";
import Ava from "../../assets/npc/ava.png";
import Gatekeeper from "../../assets/npc/GatekeeperAxion.png";
import Grandpa from "../../assets/npc/Grandpa.png";
import Wai from "../../assets/npc/Wai.png";
import SirBen from "../../assets/npc/BenSir.png";
import Cipher from "../../assets/npc/Cipher.png";
import Lina from "../../assets/npc/Lina.png";
import EarthBot from "../../assets/npc/EarthBot.png";
import AirBot from "../../assets/npc/AirBot.png";
import FireBot from "../../assets/npc/FireBot.png";
import WaterBot from "../../assets/npc/WaterBot.png";
import LightningBot from "../../assets/npc/LightningBot.png";
import NaturalBot from "../../assets/npc/NaturalBot.png";
import IceBot from "../../assets/npc/IceBot.png";
import Kargie from "../../assets/npc/Kargie.png";
import Selena from "../../assets/npc/Selena.png";

interface NPC {
  name: string;
  image: string;
}

const npcs: NPC[] = [
  { name: "Merchant David", image: Grand },
  { name: "Kai", image: Auntie },
  { name: "Chong", image: Uncle },
  { name: "Vera", image: Ava },
  { name: "Luma", image: Gatekeeper },
  { name: "Kora", image: Grandpa },
  { name: "Wai", image: Wai },
  { name: "Ben", image: SirBen },
  { name: "Axel", image: Cipher },
  { name: "Mira", image: Lina },
  { name: "NatureBot", image: EarthBot },
  { name: "AirBot", image: AirBot },
  { name: "FireBot", image: FireBot },
  { name: "WaterBot", image: WaterBot },
  { name: "LightningBot", image: LightningBot },
  { name: "GeneralBot", image: NaturalBot },
  { name: "IceBot", image: IceBot },
  { name: "Kargie", image: Kargie },
  { name: "Selena", image: Selena },
];

const AdminNPC: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">NPC</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {npcs.map((npc) => (
          <div
            key={npc.name}
            className="bg-slate-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
          >
            <div className="p-4 h-48 flex items-center justify-center bg-slate-700">
              <img
                src={npc.image}
                alt={npc.name}
                className="max-h-40 max-w-full object-contain"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-white text-center">
                {npc.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNPC;
