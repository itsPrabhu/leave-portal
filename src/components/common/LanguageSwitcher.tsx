import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="uppercase">{lang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("ta")}>தமிழ் (Tamil)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
