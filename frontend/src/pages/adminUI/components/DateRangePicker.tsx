// frontend/src/pages/adminUI/components/DateRangePicker.tsx
import React from 'react';
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar } from "../../../components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "../../../components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onApplyFilter: () => void;
  onResetFilter: () => void;
  isFiltered: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyFilter,
  onResetFilter,
  isFiltered
}) => {
  // Kiểm tra nếu có thể áp dụng bộ lọc (cả hai ngày đều đã chọn)
  const canApplyFilter = !!startDate && !!endDate;
  
  // Hiển thị định dạng ngày
  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'PPP') : 'Select date';
  };
  
  // Thời gian tối đa có thể chọn là ngày hiện tại
  const today = new Date();
  
  // Hiển thị thông tin về khoảng thời gian
  const getDateRangeInfo = () => {
    if (startDate && endDate) {
      // Cách tính chính xác số ngày trong khoảng
      const startDay = new Date(startDate);
      startDay.setHours(0, 0, 0, 0);
      
      const endDay = new Date(endDate);
      endDay.setHours(0, 0, 0, 0);
      
      // Tính số ngày bằng cách lấy số mili giây, chia cho số mili giây trong 1 ngày, cộng thêm 1 (để bao gồm cả ngày cuối)
      const diffTime = endDay.getTime() - startDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      return `${diffDays} day${diffDays > 1 ? 's' : ''} selected`;
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium mb-1">Start Date</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !startDate ? 'text-muted-foreground' : ''
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(startDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={onStartDateChange}
                  initialFocus
                  disabled={(date) => date > today} // Không cho phép chọn ngày trong tương lai
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium mb-1">End Date</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !endDate ? 'text-muted-foreground' : ''
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(endDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  initialFocus
                  disabled={(date) => {
                    // Không cho phép chọn ngày trước ngày bắt đầu hoặc ngày trong tương lai
                    return (startDate ? date < startDate : false) || date > today;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex gap-2 items-end">
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={onApplyFilter}
              disabled={!canApplyFilter}
            >
              Apply Filter
            </Button>
            
            {isFiltered && (
              <Button
                variant="outline"
                onClick={onResetFilter}
              >
                Reset
              </Button>
            )}
          </div>
          
          {/* Information about the selected date range */}
          {canApplyFilter && (
            <div className="text-xs text-gray-500 mt-2">
              {getDateRangeInfo()} selected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangePicker;