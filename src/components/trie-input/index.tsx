// Import necessary components and hooks
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, GripVerticalIcon, EyeIcon } from "lucide-react";

// Import dnd-kit components
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Textarea } from "../ui/textarea";

// Define the type for a row
export interface Row {
  id: string;
  action: "insert" | "remove" | "";
  key: string;
  value: string;
  isSubmitted: boolean;
  isHidden: boolean; // Property to track temporary removal
}

type TrieInputProps = {
  initialRows?: Row[];
  onChange: (value: Row[]) => void;
};

export const TrieInput = ({ onChange, initialRows }: TrieInputProps) => {
  // Initialize state with one empty row
  const [rows, setRows] = useState<Row[]>([
    {
      id: "1",
      action: "",
      key: "",
      value: "",
      isSubmitted: false,
      isHidden: false,
    },
  ]);

  useEffect(() => {
    if (initialRows && initialRows.length > 0) {
      setRows([
        ...initialRows.map((row) => ({ ...row, isHidden: false })), // Ensure isHidden is set to false
        {
          id: (initialRows.length + 1).toString(),
          action: "",
          key: "",
          value: "",
          isSubmitted: false,
          isHidden: false,
        },
      ]);
    }
  }, [initialRows]);

  const modifyRows = (newRows: Row[]) => {
    setRows(newRows);
    // Emit rows excluding the hidden ones
    onChange(newRows.filter((row) => row.isSubmitted && !row.isHidden));
  };

  // Event handlers remain the same...
  // (handleSelectChange, handleKeyChange, handleValueChange, etc.)

  // Handle changes in the Select component
  const handleSelectChange = (index: number, value: string): void => {
    const newRows = [...rows];
    newRows[index].action = value as "insert" | "remove" | "";
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
  const handleInsertRow = (index: number): void => {
    const newRows = [...rows];
    newRows[index].isSubmitted = true;
    newRows.push({
      id: (parseInt(rows[rows.length - 1].id) + 1).toString(),
      action: "",
      key: "",
      value: "",
      isSubmitted: false,
      isHidden: false,
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

  // Handle eye icon click (temporary removal)
  const handleEyeIconClick = (index: number): void => {
    const newRows = [...rows];
    newRows[index].isHidden = !newRows[index].isHidden; // Toggle the isHidden state
    modifyRows(newRows);
  };

  // Separate submitted and unsubmitted rows
  const submittedRows = rows.filter((row) => row.isSubmitted);
  const unsubmittedRows = rows.filter((row) => !row.isSubmitted);

  let rowIndex = 0; // Initialize row index

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={submittedRows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
        {submittedRows.map((row) => {
          // Get the index in the original rows array
          const index = rows.findIndex((r) => r.id === row.id);
          const currentRowIndex = rowIndex++;
          return (
            <SortableItem
              key={row.id}
              id={row.id}
              index={index}
              row={row}
              handleSelectChange={handleSelectChange}
              handleKeyChange={handleKeyChange}
              handleValueChange={handleValueChange}
              handleInsertRow={handleInsertRow}
              handleRemoveRow={handleRemoveRow}
              handleEyeIconClick={handleEyeIconClick}
              rowNumber={currentRowIndex} // Pass the overall row number
            />
          );
        })}
      </SortableContext>

      {/* Render the unsubmitted row(s) without sortable functionality */}
      {unsubmittedRows.map((row) => {
        const index = rows.findIndex((r) => r.id === row.id);
        const currentRowIndex = rowIndex++;
        return (
          <InputRow
            key={row.id}
            index={index}
            row={row}
            handleSelectChange={handleSelectChange}
            handleKeyChange={handleKeyChange}
            handleValueChange={handleValueChange}
            handleInsertRow={handleInsertRow}
            rowNumber={currentRowIndex} // Pass the overall row number
          />
        );
      })}
    </DndContext>
  );
};

// SortableItem Component
interface SortableItemProps {
  id: string;
  index: number;
  row: Row;
  handleSelectChange: (index: number, value: string) => void;
  handleKeyChange: (index: number, value: string) => void;
  handleValueChange: (index: number, value: string) => void;
  handleInsertRow: (index: number) => void;
  handleRemoveRow: (index: number) => void;
  handleEyeIconClick: (index: number) => void;
  rowNumber: number; // New prop for alternating background
}

function SortableItem(props: SortableItemProps): JSX.Element {
  const {
    id,
    index,
    row,
    handleSelectChange,
    handleKeyChange,
    handleValueChange,
    handleRemoveRow,
    handleEyeIconClick,
    rowNumber,
  } = props;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const backgroundClass = rowNumber % 2 === 0 ? "bg-white" : "bg-gray-100";

  return (
    <div ref={setNodeRef} style={style} className={`flex p-3 ${row.isHidden ? "opacity-50" : ""} ${backgroundClass}`}>
      <div>
        {/* Drag Handle */}
        <Button variant="ghost" className="mr-1 px-1" {...attributes} {...listeners}>
          <GripVerticalIcon className="w-4 h-4 cursor-move" />
        </Button>
      </div>
      <div className="flex-col w-full">
        <div className="flex items-center mb-2">
          <div className="w-[150px]">
            <Select
              onValueChange={(value) => handleSelectChange(index, value)}
              value={row.action}
              disabled={row.isHidden}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insert">Insert</SelectItem>
                <SelectItem value="remove">Remove</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Key"
            value={row.key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
            disabled={row.isHidden}
          />
          {/* Eye Icon */}
          <Button variant="ghost" onClick={() => handleEyeIconClick(index)}>
            <EyeIcon className={`w-4 h-4 ${row.isHidden ? "text-gray-500" : ""}`} />
          </Button>
          {/* Remove Button */}
          <Button variant="ghost" onClick={() => handleRemoveRow(index)}>
            <MinusIcon className="w-4 h-4" />
          </Button>
        </div>
        <Textarea
          placeholder="Value"
          disabled={row.action === "remove" || row.isHidden}
          value={row.value}
          onChange={(e) => handleValueChange(index, e.target.value)}
        />
      </div>
    </div>
  );
}

// InputRow Component
interface InputRowProps {
  index: number;
  row: Row;
  handleSelectChange: (index: number, value: string) => void;
  handleKeyChange: (index: number, value: string) => void;
  handleValueChange: (index: number, value: string) => void;
  handleInsertRow: (index: number) => void;
  rowNumber: number; // New prop for alternating background
}

const InputRow = (props: InputRowProps) => {
  const { index, row, handleSelectChange, handleKeyChange, handleValueChange, handleInsertRow, rowNumber } = props;

  const backgroundClass = rowNumber % 2 === 0 ? "bg-white" : "bg-gray-100";

  return (
    <div className={`flex space-x-2 items-center my-2 ${backgroundClass}`}>
      <div className="w-[150px]">
        <Select onValueChange={(value) => handleSelectChange(index, value)} value={row.action}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insert">Insert</SelectItem>
            <SelectItem value="remove">Remove</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input placeholder="Key" value={row.key} onChange={(e) => handleKeyChange(index, e.target.value)} />
      <Input placeholder="Value" value={row.value} onChange={(e) => handleValueChange(index, e.target.value)} />
      {/* Add Button */}
      <Button
        variant="ghost"
        onClick={() => handleInsertRow(index)}
        disabled={!row.action || !row.key || (row.action === "insert" && !row.value)}
      >
        <PlusIcon className="w-4 h-4" />
      </Button>
      {/* No drag handle here */}
    </div>
  );
};
