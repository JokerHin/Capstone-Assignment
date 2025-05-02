import React from "react";
import Grand from "../../assets/npc/GrandCompiler.png";
import Auntie from "../../assets/npc/AuntieAng.png";
import Uncle from "../../assets/npc/UncleChong.png";
import Ava from "../../assets/npc/Ava.png";
import Gatekeeper from "../../assets/npc/GatekeeperAxion.png";
import Grandpa from "../../assets/npc/Grandpa.png";
import Wai from "../../assets/npc/Wai.png";
import SirBen from "../../assets/npc/BenSir.png";
import KarbotA from "../../assets/npc/Karbot3.png";
import KarbotB from "../../assets/npc/Karbot2.png";
import Karbot from "../../assets/npc/Karbot.png";
import Cipher from "../../assets/npc/Cipher.png";
import Lina from "../../assets/npc/Lina.png";

interface NPC {
  name: string;
  image: string;
}

const npcs: NPC[] = [
  { name: "Grand Compiler", image: Grand },
  { name: "Auntie Ang", image: Auntie },
  { name: "Uncle Chong", image: Uncle },
  { name: "Ava", image: Ava },
  { name: "Gatekeeper Axion", image: Gatekeeper },
  { name: "Grandpa", image: Grandpa },
  { name: "Wai", image: Wai },
  { name: "Sir Ben", image: SirBen },
  { name: "Karbot A", image: KarbotA },
  { name: "Karbot B", image: KarbotB },
  { name: "Karbot", image: Karbot },
  { name: "Cipher", image: Cipher },
  { name: "Lina", image: Lina },
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
