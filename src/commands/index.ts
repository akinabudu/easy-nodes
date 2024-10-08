import { Composer, type CommandContext } from "grammy";
import { StartCommand } from "./start.command";
import { CreateInstanceCommand } from "./createinstance.command";
import { GetRunningCommand } from "./get-running-command";
// import { StopInstanceCommand } from "./stop.command";
import { ExtendInstanceCommand } from "./extend-instance.command";
import { HelpCommand } from "./help.command";
let commandsComposer = new Composer();

let commands: any[] = [
  { name: "start", command: StartCommand },
  { name: "create_node", command: CreateInstanceCommand },
  { name: "get_running", command: GetRunningCommand },
  // { name: "stop_instance", command: StopInstanceCommand },
  { name: "extend_node", command: ExtendInstanceCommand },
  { name: "help", command: HelpCommand },
];

for (let index = 0; index < commands.length; index++) {
  commandsComposer.command(commands[index].name, commands[index].command);
}
export { commandsComposer };



