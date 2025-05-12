import React from "react";
import Grand from "../../../public/assets/npc/GrandCompiler.png";
import Auntie from "../../../public/assets/npc/AuntieAng.png";
import Uncle from "../../../public/assets/npc/UncleChong.png";
import Ava from "../../../public/assets/npc/ava.png";
import Gatekeeper from "../../../public/assets/npc/GatekeeperAxion.png";
import Grandpa from "../../../public/assets/npc/Grandpa.png";
import Wai from "../../../public/assets/npc/Wai.png";
import SirBen from "../../../public/assets/npc/BenSir.png";
import Cipher from "../../../public/assets/npc/Cipher.png";
import Lina from "../../../public/assets/npc/Lina.png";
import EarthBot from "../../../public/assets/npc/EarthBot.png";
import AirBot from "../../../public/assets/npc/AirBot.png";
import FireBot from "../../../public/assets/npc/FireBot.png";
import WaterBot from "../../../public/assets/npc/WaterBot.png";
import LightningBot from "../../../public/assets/npc/LightningBot.png";
import NaturalBot from "../../../public/assets/npc/NaturalBot.png";
import IceBot from "../../../public/assets/npc/IceBot.png";
import Kargie from "../../../public/assets/npc/Kargie.png";
import Selena from "../../../public/assets/npc/Selena.png";

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
  { name: "Nature Bot", image: EarthBot },
  { name: "Air Bot", image: AirBot },
  { name: "Fire Bot", image: FireBot },
  { name: "Water Bot", image: WaterBot },
  { name: "Lightning Bot", image: LightningBot },
  { name: "Bot", image: NaturalBot },
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
