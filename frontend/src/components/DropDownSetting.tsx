import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  Cpu,
  DollarSign,
  MessageSquareCode,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

function DropDownSetting() {
  // AI parameters with default values
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.8);
  const [seed, setSeed] = useState(10);
  // const [topk, setTopk] = useState(40);
  const [maxTokens, setMaxTokens] = useState(750);
  const [model, setModel] = useState("llama3-8b-8192");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="gap-2 bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-gray-800 text-white p-4 w-80 space-y-4"
      >
        {/* Model Select */}
        <div>
          <label className="flex items-center gap-2 font-semibold mb-1 text-sm">
            <Cpu className="w-4 h-4" />
            Select Model
          </label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white">
              <SelectItem value="llama3-8b-8192">LLaMA 3 8B 8192</SelectItem>
              <SelectItem value="llama3-70b-8192">LLaMA 3 70B 8192</SelectItem>
              <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">
                LLaMA 4 Scout 17B
              </SelectItem>
              <SelectItem value="allam-2-7b">Allam 2 7B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* System Prompt */}
        <div>
          <label className="flex items-center gap-2 font-semibold mb-1 text-sm">
            <MessageSquareCode className="w-4 h-4" />
            System Prompt
          </label>
          <Textarea
            rows={2}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="bg-gray-700 text-white resize-none"
          />
        </div>

        {/* Parameters */}
        <div>
          <label className="flex items-center gap-2 font-semibold mb-1 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Parameters
          </label>

          <div className="space-y-2">
            {/* Temperature */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Temperature</span>
                <span className="text-gray-400">{temperature.toFixed(2)}</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[temperature]}
                onValueChange={([val]) => setTemperature(val)}
              />
            </div>

            {/* Top_p */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Top_p</span>
                <span className="text-gray-400">{topP.toFixed(2)}</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[topP]}
                onValueChange={([val]) => setTopP(val)}
              />
            </div>

            {/* Seed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Seed</span>
                <span className="text-gray-400">{seed.toFixed(0)}</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[seed]}
                onValueChange={([val]) => setSeed(val)}
              />
            </div>

            {/* Max Tokens */}
            <div>
              <label className="text-xs text-gray-300">Max Tokens</label>
              <Input
                type="number"
                min={10}
                max={4096}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="bg-gray-700 text-white mt-1"
              />
            </div>
          </div>
        </div>

        {/* Token Usage */}
        <div>
          <label className="flex items-center gap-2 font-semibold mb-1 text-sm">
            <DollarSign className="w-4 h-4" />
            Token Usage (Est.)
          </label>
          <p className="text-xs text-gray-400">
            This message used ~127 tokens. Estimated cost: $0.0001
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropDownSetting;
