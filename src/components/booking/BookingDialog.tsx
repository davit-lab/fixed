import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: BookingFormData) => Promise<void>;
  equipmentTitle: string;
  price: number;
  isLoading?: boolean;
}

export interface BookingFormData {
  bookingDate: Date;
  pickupTime: string;
  renterPhone: string;
  renterAddress: string;
  notes: string;
  termsAgreed: boolean;
  noCancellationAgreed: boolean;
}

const PICKUP_TIMES = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const TERMS = [
  "დაჯავშნის შემდეგ გაუქმება დაუშვებელია დადასტურებიდან 24 საათის შემდეგ",
  "თქვენ ვალდებული ხართ მიუთითოთ სწორი საკონტაქტო ინფორმაცია",
  "სერვისის მიმწოდებელი დაგიკავშირდებათ მითითებულ ნომერზე",
  "გადახდა ხდება სერვისის მიღებისას",
  "დაგვიანების შემთხვევაში გთხოვთ წინასწარ შეატყობინოთ მფლობელს",
];

export const BookingDialog = ({
  open,
  onClose,
  onConfirm,
  equipmentTitle,
  price,
  isLoading = false,
}: BookingDialogProps) => {
  const [step, setStep] = useState(1);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState<string>("");
  const [renterPhone, setRenterPhone] = useState("");
  const [renterAddress, setRenterAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [noCancellationAgreed, setNoCancellationAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!bookingDate) newErrors.bookingDate = "აირჩიეთ თარიღი";
    if (!pickupTime) newErrors.pickupTime = "აირჩიეთ დრო";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!renterPhone || renterPhone.length < 9) {
      newErrors.renterPhone = "შეიყვანეთ სწორი ტელეფონის ნომერი";
    }
    if (!renterAddress || renterAddress.length < 5) {
      newErrors.renterAddress = "შეიყვანეთ მისამართი (მინ. 5 სიმბოლო)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!termsAgreed) newErrors.termsAgreed = "გთხოვთ დაეთანხმოთ წესებს";
    if (!noCancellationAgreed) newErrors.noCancellationAgreed = "გთხოვთ დაეთანხმოთ გაუქმების პირობებს";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    if (!bookingDate) return;

    await onConfirm({
      bookingDate,
      pickupTime,
      renterPhone,
      renterAddress,
      notes,
      termsAgreed,
      noCancellationAgreed,
    });
  };

  const resetForm = () => {
    setStep(1);
    setBookingDate(undefined);
    setPickupTime("");
    setRenterPhone("");
    setRenterAddress("");
    setNotes("");
    setTermsAgreed(false);
    setNoCancellationAgreed(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg rounded-[2rem] p-0 overflow-hidden border-none">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              დაჯავშნა
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              {equipmentTitle}
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                    step >= s
                      ? "bg-white text-primary"
                      : "bg-white/20 text-white/60"
                  )}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "flex-1 h-1 rounded-full transition-all",
                      step > s ? "bg-white" : "bg-white/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-white/60">
            <span>თარიღი</span>
            <span>კონტაქტი</span>
            <span>დასტური</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Date & Time */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    აირჩიეთ თარიღი
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-bold rounded-xl h-14 border-2",
                          !bookingDate && "text-muted-foreground",
                          errors.bookingDate && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                        {bookingDate
                          ? format(bookingDate, "PPP", { locale: ka })
                          : "აირჩიეთ თარიღი"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                      <Calendar
                        mode="single"
                        selected={bookingDate}
                        onSelect={setBookingDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.bookingDate && (
                    <p className="text-xs text-red-500 font-medium">{errors.bookingDate}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    მისვლის დრო
                  </Label>
                  <Select value={pickupTime} onValueChange={setPickupTime}>
                    <SelectTrigger
                      className={cn(
                        "w-full h-14 rounded-xl font-bold border-2",
                        errors.pickupTime && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="აირჩიეთ საათი" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {PICKUP_TIMES.map((time) => (
                        <SelectItem key={time} value={time} className="font-medium">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.pickupTime && (
                    <p className="text-xs text-red-500 font-medium">{errors.pickupTime}</p>
                  )}
                </div>

                {/* Price Summary */}
                <div className="bg-secondary/50 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">ფასი / საათი</span>
                  <span className="text-2xl font-black text-primary">₾{price}</span>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    ტელეფონის ნომერი
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+995 5XX XXX XXX"
                    value={renterPhone}
                    onChange={(e) => setRenterPhone(e.target.value)}
                    className={cn(
                      "h-14 rounded-xl font-bold border-2",
                      errors.renterPhone && "border-red-500"
                    )}
                  />
                  {errors.renterPhone && (
                    <p className="text-xs text-red-500 font-medium">{errors.renterPhone}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    მისამართი (სად უნდა მოვიდეს)
                  </Label>
                  <Textarea
                    placeholder="მაგ: თბილისი, ვაკე, ჭავჭავაძის 12"
                    value={renterAddress}
                    onChange={(e) => setRenterAddress(e.target.value)}
                    className={cn(
                      "min-h-[100px] rounded-xl font-medium border-2 resize-none",
                      errors.renterAddress && "border-red-500"
                    )}
                  />
                  {errors.renterAddress && (
                    <p className="text-xs text-red-500 font-medium">{errors.renterAddress}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    დამატებითი შენიშვნა (არასავალდებულო)
                  </Label>
                  <Textarea
                    placeholder="მაგ: მესამე სართული, კოდი 1234..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] rounded-xl font-medium border-2 resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Terms & Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Booking Summary */}
                <div className="bg-secondary/50 rounded-2xl p-5 space-y-4">
                  <h4 className="font-black text-sm uppercase tracking-wider">ჯავშნის დეტალები</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">თარიღი:</span>
                      <span className="font-bold">
                        {bookingDate && format(bookingDate, "PPP", { locale: ka })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">დრო:</span>
                      <span className="font-bold">{pickupTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ტელეფონი:</span>
                      <span className="font-bold">{renterPhone}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">მისამართი:</span>
                      <span className="font-bold text-right max-w-[200px]">{renterAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Terms List */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    წესები და პირობები
                  </h4>
                  <ul className="space-y-2">
                    {TERMS.map((term, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Agreement Switches */}
                <div className="space-y-4">
                  <div
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                      termsAgreed ? "border-emerald-500 bg-emerald-50" : "border-border",
                      errors.termsAgreed && "border-red-500"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">ვეთანხმები წესებს და პირობებს</span>
                    </div>
                    <Switch checked={termsAgreed} onCheckedChange={setTermsAgreed} />
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                      noCancellationAgreed ? "border-emerald-500 bg-emerald-50" : "border-border",
                      errors.noCancellationAgreed && "border-red-500"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <div>
                        <span className="text-sm font-medium block">გაუქმების პირობები</span>
                        <span className="text-xs text-muted-foreground">
                          დადასტურებიდან 24სთ-ის შემდეგ გაუქმება შეუძლებელია
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={noCancellationAgreed}
                      onCheckedChange={setNoCancellationAgreed}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-14 rounded-xl font-bold"
                disabled={isLoading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                უკან
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="flex-1 h-14 rounded-xl font-bold"
              >
                შემდეგი
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 h-14 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    დადასტურება
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
