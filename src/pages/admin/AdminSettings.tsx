import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Globe, Shield } from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "EquipGeo",
    siteDescription: "საქართველოს #1 სერვისის პლატფორმა",
    contactEmail: "support@equipgeo.ge",
    maintenanceMode: false,
    allowNewRegistrations: true,
    commissionRate: 10,
  });

  const handleSave = async () => {
    // Settings would be saved to database in production
    toast.success("პარამეტრები წარმატებით შეინახა");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">პარამეტრები</h1>
        <p className="text-muted-foreground">სისტემის გლობალური კონფიგურაცია</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-500" />
              ზოგადი ინფორმაცია
            </CardTitle>
            <CardDescription>საიტის ძირითადი პარამეტრები</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">საიტის დასახელება</Label>
                <Input 
                  id="siteName" 
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">საკონტაქტო იმეილი</Label>
                <Input 
                  id="contactEmail" 
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">საიტის აღწერა</Label>
              <Textarea 
                id="siteDescription" 
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              უსაფრთხოება და წვდომა
            </CardTitle>
            <CardDescription>სისტემის წვდომის კონტროლი</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">ახალი რეგისტრაციები</Label>
                <p className="text-sm text-muted-foreground">ნება დართეთ ახალ მომხმარებლებს დარეგისტრირდნენ</p>
              </div>
              <Switch 
                checked={settings.allowNewRegistrations}
                onCheckedChange={(checked) => setSettings({ ...settings, allowNewRegistrations: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">ტექნიკური რეჟიმი</Label>
                <p className="text-sm text-muted-foreground">საიტის დროებით გათიშვა ტექნიკური სამუშაოებისთვის</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="rounded-xl px-8 h-12 font-bold gap-2 bg-amber-500 hover:bg-amber-600">
            <Save className="h-5 w-5" />
            შენახვა
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
