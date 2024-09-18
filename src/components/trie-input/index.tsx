// Import necessary components and hooks
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, GripVerticalIcon } from "lucide-react";

// Import dnd-kit components
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define the type for a row
export interface Row {
  id: string;
  action: string;
  key: string;
  value: string;
  isSubmitted: boolean;
}

type TrieInputProps = {
  initialRows?: Row[];

  onChange: (value: Row[]) => void;
};

export const TrieInput = ({ onChange, initialRows }: TrieInputProps) => {
  // Initialize state with one empty row
  const [rows, setRows] = useState<Row[]>(
    initialRows && initialRows.length > 0
      ? initialRows
      : [{ id: "1", action: "", key: "", value: "", isSubmitted: false }],
  );

  useEffect(() => {
    if (initialRows) {
      setRows(initialRows);
    }
  }, [initialRows]);

  const modifyRows = (newRows: Row[]) => {
    setRows(newRows);

    onChange(newRows.filter((row) => row.isSubmitted));
  };

  // Handle changes in the Select component
  const handleSelectChange = (index: number, value: string): void => {
    const newRows = [...rows];
    newRows[index].action = value;
    modifyRows(newRows);
  };

  // Handle changes in the Key input
  const handleKeyChange = (index: number, value: string): void => {
    const newRows = [...rows];
    newRows[index].key = value;
    modifyRows(newRows);
  };

  // Handle changes in the Value input
  const handleValueChange = (index: number, value: string): void => {
    const newRows = [...rows];
    newRows[index].value = value;
    modifyRows(newRows);
  };

  // Handle adding a new row
  const handleAddRow = (index: number): void => {
    const newRows = [...rows];
    newRows[index].isSubmitted = true;
    newRows.push({
      id: (parseInt(rows[rows.length - 1].id) + 1).toString(),
      action: "",
      key: "",
      value: "",
      isSubmitted: false,
    });
    modifyRows(newRows);
  };

  // Handle removing a row
  const handleRemoveRow = (index: number): void => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    modifyRows(newRows);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const submittedRows = rows.filter((row) => row.isSubmitted);
      const oldIndex = submittedRows.findIndex((row) => row.id === active.id);
      const newIndex = submittedRows.findIndex((row) => row.id === over.id);
      const newSubmittedRows = arrayMove(submittedRows, oldIndex, newIndex);

      // Merge back with the unsubmitted row(s)
      const unsubmittedRows = rows.filter((row) => !row.isSubmitted);
      modifyRows([...newSubmittedRows, ...unsubmittedRows]);
    }
  };

  // Separate submitted and unsubmitted rows
  const submittedRows = rows.filter((row) => row.isSubmitted);
  const unsubmittedRows = rows.filter((row) => !row.isSubmitted);

  return (
    <div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={submittedRows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
          {submittedRows.map((row) => {
            // Get the index in the original rows array
            const index = rows.findIndex((r) => r.id === row.id);
            return (
              <SortableItem
                key={row.id}
                id={row.id}
                index={index}
                row={row}
                handleSelectChange={handleSelectChange}
                handleKeyChange={handleKeyChange}
                handleValueChange={handleValueChange}
                handleAddRow={handleAddRow}
                handleRemoveRow={handleRemoveRow}
              />
            );
          })}
        </SortableContext>

        {/* Render the unsubmitted row(s) without sortable functionality */}
        {unsubmittedRows.map((row) => {
          const index = rows.findIndex((r) => r.id === row.id);
          return (
            <InputRow
              key={row.id}
              index={index}
              row={row}
              handleSelectChange={handleSelectChange}
              handleKeyChange={handleKeyChange}
              handleValueChange={handleValueChange}
              handleAddRow={handleAddRow}
            />
          );
        })}
      </DndContext>
    </div>
  );
};

interface SortableItemProps {
  id: string;
  index: number;
  row: Row;
  handleSelectChange: (index: number, value: string) => void;
  handleKeyChange: (index: number, value: string) => void;
  handleValueChange: (index: number, value: string) => void;
  handleAddRow: (index: number) => void;
  handleRemoveRow: (index: number) => void;
}

function SortableItem(props: SortableItemProps): JSX.Element {
  const { id, index, row, handleSelectChange, handleKeyChange, handleValueChange, handleRemoveRow } = props;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex space-x-2 items-center my-2">
      <div className="w-[150px]">
        <Select onValueChange={(value) => handleSelectChange(index, value)} value={row.action}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Add</SelectItem>
            <SelectItem value="remove">Remove</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input placeholder="Key" value={row.key} onChange={(e) => handleKeyChange(index, e.target.value)} />
      <Input placeholder="Value" value={row.value} onChange={(e) => handleValueChange(index, e.target.value)} />
      {/* Drag Handle */}
      <Button variant="ghost" {...attributes} {...listeners}>
        <GripVerticalIcon className="w-4 h-4 cursor-move" />
      </Button>
      {/* Remove Button */}
      <Button variant="ghost" onClick={() => handleRemoveRow(index)}>
        <MinusIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface InputRowProps {
  index: number;
  row: Row;
  handleSelectChange: (index: number, value: string) => void;
  handleKeyChange: (index: number, value: string) => void;
  handleValueChange: (index: number, value: string) => void;
  handleAddRow: (index: number) => void;
}

const InputRow = (props: InputRowProps) => {
  const { index, row, handleSelectChange, handleKeyChange, handleValueChange, handleAddRow } = props;

  return (
    <div className="flex space-x-2 items-center my-2">
      <div className="w-[150px]">
        <Select onValueChange={(value) => handleSelectChange(index, value)} value={row.action}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Add</SelectItem>
            <SelectItem value="remove">Remove</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input placeholder="Key" value={row.key} onChange={(e) => handleKeyChange(index, e.target.value)} />
      <Input placeholder="Value" value={row.value} onChange={(e) => handleValueChange(index, e.target.value)} />
      {/* Add Button */}
      <Button variant="ghost" onClick={() => handleAddRow(index)} disabled={!row.action || !row.key || !row.value}>
        <PlusIcon className="w-4 h-4" />
      </Button>
      {/* No drag handle here */}
    </div>
  );
};