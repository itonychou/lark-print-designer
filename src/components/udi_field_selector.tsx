import React, { useState, useMemo } from 'react';
import { useTableFieldData } from '@/store/element_list';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface UdiFieldSelectorProps {
  value: string;
  onChange: (fieldId: string, fieldName: string) => void;
  placeholder?: string;
}

export const UdiFieldSelector: React.FC<UdiFieldSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Search or select field...',
}) => {
  const { fieldMap, fieldIds } = useTableFieldData();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);

  // 模糊匹配字段
  const matchedFields = useMemo(() => {
    if (!debouncedSearch) return fieldIds;
    const searchLower = debouncedSearch.toLowerCase();
    return fieldIds.filter((id) => {
      const field = fieldMap.get(id);
      if (!field) return false;
      return (
        field.name.toLowerCase().includes(searchLower) ||
        id.toLowerCase().includes(searchLower)
      );
    });
  }, [debouncedSearch, fieldIds, fieldMap]);

  // 获取当前选中的字段信息
  const selectedField = useMemo(() => {
    if (!value) return null;
    return fieldMap.get(value);
  }, [value, fieldMap]);

  // 处理字段选择
  const handleSelect = (fieldId: string) => {
    const field = fieldMap.get(fieldId);
    if (field) {
      onChange(fieldId, field.name);
      setSearchText('');
    }
  };

  // 处理手动输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // 验证字段是否存在
  const isValidField = useMemo(() => {
    if (!value) return true;
    return fieldMap.has(value);
  }, [value, fieldMap]);

  return (
    <div className="space-y-2">
      {/* 搜索输入框 */}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchText}
        onChange={handleInputChange}
        className={!isValidField ? 'border-red-500' : ''}
      />

      {/* 字段下拉选择 */}
      <Select value={value} onValueChange={handleSelect}>
        <SelectTrigger className={!isValidField ? 'border-red-500' : ''}>
          <SelectValue placeholder="Select a field">
            {selectedField ? (
              <div className="flex items-center gap-2">
                <span>{selectedField.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedField.id}
                </Badge>
              </div>
            ) : (
              'Select a field'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {matchedFields.length === 0 ? (
            <div className="px-2 py-2 text-sm text-gray-500">
              No matching fields found
            </div>
          ) : (
            matchedFields.map((fieldId) => {
              const field = fieldMap.get(fieldId);
              if (!field) return null;
              return (
                <SelectItem key={fieldId} value={fieldId}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{field.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {fieldId}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {/* 验证状态提示 */}
      {!isValidField && value && (
        <p className="text-sm text-red-500">
          Field &apos;{value}&apos; does not exist in the current table
        </p>
      )}

      {/* 字段统计信息 */}
      <p className="text-xs text-gray-500">
        {matchedFields.length} of {fieldIds.length} fields available
      </p>
    </div>
  );
};

export default UdiFieldSelector;
