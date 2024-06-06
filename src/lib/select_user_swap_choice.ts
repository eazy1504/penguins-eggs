/**
 * ./src/lib/select_user_swap_choice.ts
 * penguins-eggs v.10.0.0 / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */


import inquirer from 'inquirer'
import yaml from 'js-yaml'
import fs from 'node:fs'

import { IPartitions } from '../interfaces/index.js'

export default async function selectUserSwapChoice(): Promise<string> {
  let partitions = {} as IPartitions
  if (fs.existsSync('/etc/calamares/modules/partition.conf')) {
    partitions = yaml.load(fs.readFileSync('/etc/calamares/modules/partition.conf', 'utf8')) as unknown as IPartitions
  } else {
    partitions.userSwapChoices = ['none', 'small', 'suspend', 'file']
    partitions.initialSwapChoice = 'small'
  }

  const questions: Array<Record<string, any>> = [
    {
      choices: partitions.userSwapChoices,
      default: partitions.initialSwapChoice,
      message: 'Select the swap choice',
      name: 'userSwapChoices',
      type: 'list'
    }
  ]

  return new Promise((resolve) => {
    inquirer.prompt(questions).then((options: any) => {
      resolve(options.userSwapChoices)
    })
  })
}
