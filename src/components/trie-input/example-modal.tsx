// ExampleModal.tsx

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Row } from ".";

// eslint-disable-next-line react-refresh/only-export-components
export const examples: { name: string; rows: Row[] }[] = [
  {
    name: "Simple 2 elements",
    rows: [
      {
        id: "1",
        action: "insert",
        key: "5dffe0e2c9f089d30e50b04ee562445cf2c0e7e7d677580ef0ccf2c6fa3522dd",
        value:
          "bb11c256876fe10442213dd78714793394d2016134c28a64eb27376ddc147fc6044df72bdea44d9ec66a3ea1e6d523f7de71db1d05a980e001e9fa",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "2",
        action: "insert",
        key: "5a37871e8a54fde4834d83851469e635713615ab1037128df138a6cd223f1242",
        value: "b8bded4e1c",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
    ],
  },
  {
    name: "Test vectors 10",
    rows: [
      {
        id: "1",
        action: "insert",
        key: "5dffe0e2c9f089d30e50b04ee562445cf2c0e7e7d677580ef0ccf2c6fa3522dd",
        value:
          "bb11c256876fe10442213dd78714793394d2016134c28a64eb27376ddc147fc6044df72bdea44d9ec66a3ea1e6d523f7de71db1d05a980e001e9fa",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "2",
        action: "insert",
        key: "df08871e8a54fde4834d83851469e635713615ab1037128df138a6cd223f1242",
        value: "b8bded4e1c",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "3",
        action: "insert",
        key: "7723a8383e43a1713eb920bae44880b2ae9225ea2d38c031cf3b22434b4507e7",
        value: "e46ddd41a5960807d528f5d9282568e622a023b94b72cb63f0353baff189257d",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "4",
        action: "insert",
        key: "3e7d409b9037b1fd870120de92ebb7285219ce4526c54701b888c5a13995f73c",
        value: "9bc5d0",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "5",
        action: "insert",
        key: "c2d3bda8f77cc483d2f4368cf998203097230fd353d2223e5a333eb58f76a429",
        value: "9ae1dc59670bd3ef6fb51cbbbc05f1d2635fd548cb31f72500000a",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "6",
        action: "insert",
        key: "6bf8460545baf5b0af874ebbbd56ae09ee73cd24926b4549238b797b447e050a",
        value: "0964801caa928bc8c1869d60dbf1d8233233e0261baf725f2631d2b27574efc0316ce3067b4fccfa607274",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "7",
        action: "insert",
        key: "832c15668a451578b4c69974085280b4bac5b01e220398f06e06a1d0aff2859a",
        value: "4881dd3238fd6c8af1090d455e7b449a",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "8",
        action: "insert",
        key: "c7a04effd2c0cede0279747f58bd210d0cc9d65c2eba265c6b4dfbc058a7047b",
        value:
          "d1fddfd63fd00cd6749a441b6ceaea1f250982a3a6b6d38f1b40cae00972cce3f9f4eaf7f9d7bc3070bd1e8d088500b10ca72e5ed5956f62",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "9",
        action: "insert",
        key: "9e78a15cc0b45c83c83218efadd234cbac22dbffb24a76e2eb5f6a81d32df616",
        value:
          "e8256c6b5a9623cf2b293090f78f8fbceea6fc3991ac5f872400608f14d2a8b3d494fcda1c51d93b9904e3242cdeaa4b227c68cea89cca05ab6b5296edf105",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "10",
        action: "insert",
        key: "03345958f90731bce89d07c2722dc693425a541b5230f99a6867882993576a23",
        value:
          "cd759a8d88edb46dda489a45ba6e48a42ce7efd36f1ca31d3bdfa40d2091f27740c5ec5de746d90d9841b986f575d545d0fb642398914eaab5",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
    ],
  },
  {
    name: "Same prefixes",
    rows: [
      {
        id: "1",
        action: "insert",
        key: "5dffe0e2c9f089d30e50b04ee562445cf2c0e7e7d677580ef0ccf2c6fa3522dd",
        value:
          "bb11c256876fe10442213dd78714793394d2016134c28a64eb27376ddc147fc6044df72bdea44d9ec66a3ea1e6d523f7de71db1d05a980e001e9fa",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
      {
        id: "2",
        action: "insert",
        key: "5dff871e8a54fde4834d83851469e635713615ab1037128df138a6cd223f1242",
        value: "b8bded4e1c",
        isSubmitted: true,
        isHidden: false,
        isEditing: false,
      },
    ],
  },
  // Add more examples as needed
];
interface ExampleModalProps {
  onSelect: (rows: Row[]) => void;
}

function ExampleModal({ onSelect }: ExampleModalProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);

  // Define some example data

  const handleSelectExample = (rows: Row[]) => {
    onSelect(rows);
    setOpen(false);
  };

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)}>
        Open Examples
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select an Example</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{example.name}</span>
                <Button variant="outline" onClick={() => handleSelectExample(example.rows)}>
                  Select
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ExampleModal;
