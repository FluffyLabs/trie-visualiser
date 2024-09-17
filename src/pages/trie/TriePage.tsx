import { Trie } from "@/components/trie";
import { blake2bTrieHasher } from "@/components/trie/blake2b.node";
import { parseStateKey } from "@/components/trie/utils";
import { InMemoryTrie, BytesBlob } from "@typeberry/trie";
import { useState } from "react";
// import ReactJson from "react-json-view";

const vector = {
  "5dffe0e2c9f089d30e50b04ee562445cf2c0e7e7d677580ef0ccf2c6fa3522dd":
    "bb11c256876fe10442213dd78714793394d2016134c28a64eb27376ddc147fc6044df72bdea44d9ec66a3ea1e6d523f7de71db1d05a980e001e9fa",
  df08871e8a54fde4834d83851469e635713615ab1037128df138a6cd223f1242: "b8bded4e1c",
  "7723a8383e43a1713eb920bae44880b2ae9225ea2d38c031cf3b22434b4507e7":
    "e46ddd41a5960807d528f5d9282568e622a023b94b72cb63f0353baff189257d",
  "3e7d409b9037b1fd870120de92ebb7285219ce4526c54701b888c5a13995f73c": "9bc5d0",
  c2d3bda8f77cc483d2f4368cf998203097230fd353d2223e5a333eb58f76a429:
    "9ae1dc59670bd3ef6fb51cbbbc05f1d2635fd548cb31f72500000a",
  "6bf8460545baf5b0af874ebbbd56ae09ee73cd24926b4549238b797b447e050a":
    "0964801caa928bc8c1869d60dbf1d8233233e0261baf725f2631d2b27574efc0316ce3067b4fccfa607274",
  "832c15668a451578b4c69974085280b4bac5b01e220398f06e06a1d0aff2859a": "4881dd3238fd6c8af1090d455e7b449a",
  c7a04effd2c0cede0279747f58bd210d0cc9d65c2eba265c6b4dfbc058a7047b:
    "d1fddfd63fd00cd6749a441b6ceaea1f250982a3a6b6d38f1b40cae00972cce3f9f4eaf7f9d7bc3070bd1e8d088500b10ca72e5ed5956f62",
  "9e78a15cc0b45c83c83218efadd234cbac22dbffb24a76e2eb5f6a81d32df616":
    "e8256c6b5a9623cf2b293090f78f8fbceea6fc3991ac5f872400608f14d2a8b3d494fcda1c51d93b9904e3242cdeaa4b227c68cea89cca05ab6b5296edf105",
  "03345958f90731bce89d07c2722dc693425a541b5230f99a6867882993576a23":
    "cd759a8d88edb46dda489a45ba6e48a42ce7efd36f1ca31d3bdfa40d2091f27740c5ec5de746d90d9841b986f575d545d0fb642398914eaab5",
};

const getTrie = (data: { [key: string]: string }) => {
  const defaultTrie = InMemoryTrie.empty(blake2bTrieHasher);

  for (const [key, val] of Object.entries(data)) {
    const stateKey = parseStateKey(key);
    const value = BytesBlob.parseBlobNoPrefix(val);
    defaultTrie.set(stateKey, value);
  }
  return defaultTrie;
};
export const TriePage = () => {
  const [trie] = useState(getTrie(vector));
  return (
    <div className="p-6 flex flex-col h-full">
      <div>
        <h1>Trie Input</h1>
        {/* <ReactJson
          name="trie"
          src={vector}
          onEdit={(edit) => {
            if (edit.updated_src) {
              setTrie(getTrie(edit.updated_src as { [key: string]: string }));
            }
          }}
        /> */}
      </div>

      <div className="flex flex-row h-full w-full">
        {/* <div className="bg-slate-200 w-[400px] h-full">
          <p>
            0x867c48de923dee8828ae54ce7c26fbeea74eec9d698eb814af88afbc4acf3893
          </p>
          <ul className="mt-3">
            <li>Details</li>
          </ul>
        </div> */}
        <Trie trie={trie} />
      </div>
    </div>
  );
};
