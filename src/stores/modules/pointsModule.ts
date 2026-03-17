import { ref, type Ref } from 'vue'
import type { PointRecord, ExchangeItem, BackpackItem, LotteryItem, LotteryRecord } from '../types'
import { ItemRarity, ItemEffectType } from '../types'

interface PointsModule {
  currentPoints: Ref<number>
  pointRecords: Ref<PointRecord[]>
  exchangeItems: Ref<ExchangeItem[]>
  backpackItems: Ref<BackpackItem[]>
  lotteryItems: Ref<LotteryItem[]>
  lotteryRecords: Ref<LotteryRecord[]>
  lotteryCost: Ref<number>
  exchangeItem: (itemId: string) => boolean
  useItemFromBackpack: (itemId: string) => boolean
  drawLottery: (item?: LotteryItem) => BackpackItem | null
  adjustPoints: (amount: number, description: string) => void
  updateExchangeItem: (itemId: string, name: string, points: number, description: string) => void
  addExchangeItem: (name: string, points: number, description: string) => void
  removeExchangeItem: (itemId: string) => void
  addLotteryItem: (name: string, description: string, rarity: ItemRarity, probability: number, effect: string) => void
  updateLotteryItem: (itemId: string, name: string, description: string, rarity: ItemRarity, probability: number, effect: string) => void
  removeLotteryItem: (itemId: string) => void
  setLotteryCost: (cost: number) => void
}

export function createPointsModule(): PointsModule {
  // 状态
  const currentPoints = ref(0)
  const pointRecords = ref<PointRecord[]>([])
  const exchangeItems = ref<ExchangeItem[]>([
    { id: '1', name: '零食', points: 20, description: '美味零食一包' },
    { id: '2', name: '小玩具', points: 50, description: '精美小玩具一个' },
    { id: '3', name: '大玩具', points: 100, description: '超值大玩具一个' },
  ])
  const backpackItems = ref<BackpackItem[]>([])
  const lotteryItems = ref<LotteryItem[]>([
    // 普通物品 (70% 概率)
    {
      id: 'lucky-1',
      name: '幸运星',
      description: '带来好运的星星',
      rarity: ItemRarity.Common,
      probability: 30,
      icon: '✨'
    },
    {
      id: 'lucky-2',
      name: '学习笔记',
      description: '提高学习效率',
      rarity: ItemRarity.Common,
      probability: 25,
      icon: '📓'
    },
    {
      id: 'lucky-3',
      name: '能量饮料',
      description: '补充学习能量',
      rarity: ItemRarity.Common,
      probability: 15,
      icon: '🥤'
    },

    // 稀有物品 (20% 概率)
    {
      id: 'rare-1',
      name: '智慧结晶',
      description: '增加智慧的结晶',
      rarity: ItemRarity.Rare,
      probability: 10,
      effect: '使用后获得5点积分',
      effectType: ItemEffectType.ADD_POINTS_5,
      icon: '💡'
    },
    {
      id: 'rare-2',
      name: '学习加速器',
      description: '加速学习进度',
      rarity: ItemRarity.Rare,
      probability: 10,
      effect: '使用后获得额外的任务完成度',
      icon: '🚀'
    },

    // 史诗物品 (8% 概率)
    {
      id: 'epic-1',
      name: '知识宝库',
      description: '蕴含丰富知识的宝库',
      rarity: ItemRarity.Epic,
      probability: 5,
      effect: '使用后获得10点积分',
      effectType: ItemEffectType.ADD_POINTS_10,
      icon: '🏰'
    },
    {
      id: 'epic-2',
      name: '学习大师的祝福',
      description: '来自学习大师的祝福',
      rarity: ItemRarity.Epic,
      probability: 3,
      effect: '使用后所有任务获得双倍积分',
      effectType: ItemEffectType.DOUBLE_POINTS,
      icon: '🧙‍♂️'
    },

    // 传说物品 (2% 概率)
    {
      id: 'legendary-1',
      name: '学习之神的馈赠',
      description: '学习之神赐予的珍贵礼物',
      rarity: ItemRarity.Legendary,
      probability: 1,
      effect: '使用后获得20点积分和一次额外抽奖机会',
      effectType: ItemEffectType.ADD_POINTS_20,
      icon: '🌟'
    },
    {
      id: 'legendary-2',
      name: '全能学霸徽章',
      description: '全能学霸的象征',
      rarity: ItemRarity.Legendary,
      probability: 1,
      effect: '使用后解锁所有成就进度+1',
      effectType: ItemEffectType.UNLOCK_ACHIEVEMENTS,
      icon: '🏅'
    },
  ])
  const lotteryRecords = ref<LotteryRecord[]>([])
  const lotteryCost = ref(10)

  // 兑换物品（修改以支持背包）
  function exchangeItem(itemId: string): boolean {
    const item = exchangeItems.value.find((i) => i.id === itemId)
    if (!item) {
      console.error('兑换失败：未找到指定的兑换物品')
      return false
    }
    
    if (currentPoints.value < item.points) {
      console.error(`兑换失败：积分不足，需要 ${item.points} 积分，当前只有 ${currentPoints.value} 积分`)
      return false
    }
    
    // 扣除积分
    currentPoints.value -= item.points

    // 记录兑换记录
    const record: PointRecord = {
      id: `record-${Date.now()}`,
      date: new Date().toISOString(),
      description: `兑换${item.name}`,
      points: -item.points,
      type: 'exchange',
    }
    pointRecords.value.push(record)

    // 添加到背包，默认普通稀有度
    const backpackItem: BackpackItem = {
      id: `backpack-${Date.now()}`,
      originalId: item.id,
      name: item.name,
      description: item.description,
      acquiredDate: new Date().toISOString(),
      rarity: ItemRarity.Common,
      icon: '🎁'
    }
    backpackItems.value.push(backpackItem)

    return true
  }

  // 使用背包物品
  function useItemFromBackpack(itemId: string): boolean {
    const index = backpackItems.value.findIndex((item) => item.id === itemId)
    if (index !== -1) {
      // 使用非空断言操作符或重新获取item以避免类型错误
      const item = backpackItems.value[index]
      if (!item) return false // 额外的安全检查

      // 执行物品效果
      if (item.effectType) {
        // 根据物品效果类型执行不同的操作
        switch (item.effectType) {
          case ItemEffectType.ADD_POINTS_5:
            adjustPoints(5, `使用稀有物品${item.name}`)
            break
          case ItemEffectType.ADD_POINTS_10:
            adjustPoints(10, `使用史诗物品${item.name}`)
            break
          case ItemEffectType.ADD_POINTS_20:
            adjustPoints(20, `使用传说物品${item.name}`)
            // 可以在这里添加额外抽奖机会的逻辑
            break
          case ItemEffectType.UNLOCK_ACHIEVEMENTS:
            // 增加所有成就的进度
            // 这里需要通过回调函数来更新成就
            break
          case ItemEffectType.EXTRA_LOTTERY:
            // 额外抽奖机会逻辑
            console.log(`使用${item.name}获得额外抽奖机会`)
            // 这里可以实现额外抽奖机会的逻辑
            break
          case ItemEffectType.DOUBLE_POINTS:
            // 双倍积分逻辑
            console.log(`使用${item.name}获得双倍积分效果`)
            // 这里可以实现双倍积分的逻辑
            break
        }
      } else if (item.effect) {
        // 兼容旧的effect字符串格式
        // 根据物品效果执行不同的操作
        if (item.effect.includes('获得5点积分') && item.rarity === ItemRarity.Rare) {
          adjustPoints(5, `使用稀有物品${item.name}`)
        } else if (item.effect.includes('获得10点积分') && item.rarity === ItemRarity.Epic) {
          adjustPoints(10, `使用史诗物品${item.name}`)
        } else if (item.effect.includes('获得20点积分') && item.rarity === ItemRarity.Legendary) {
          adjustPoints(20, `使用传说物品${item.name}`)
          // 可以在这里添加额外抽奖机会的逻辑
        } else if (
          item.effect.includes('解锁所有成就进度') &&
          item.rarity === ItemRarity.Legendary
        ) {
          // 增加所有成就的进度
          // 这里需要通过回调函数来更新成就
        }
      }

      // 从背包移除物品
      backpackItems.value.splice(index, 1)

      // 记录使用记录
      const record: PointRecord = {
        id: `record-${Date.now()}`,
        date: new Date().toISOString(),
        description: `使用物品${item.name}`,
        points: 0,
        type: 'exchange',
      }
      pointRecords.value.push(record)

      return true
    }
    return false
  }

  // 新增抽奖方法
  function drawLottery(item?: LotteryItem): BackpackItem | null {
    // 检查积分是否足够
    if (currentPoints.value < lotteryCost.value) {
      console.error(`抽奖失败：积分不足，需要 ${lotteryCost.value} 积分，当前只有 ${currentPoints.value} 积分`)
      return null
    }

    // 扣除积分
    currentPoints.value -= lotteryCost.value

    // 记录抽奖记录
    const record: PointRecord = {
      id: `record-${Date.now()}`,
      date: new Date().toISOString(),
      description: '参与抽奖',
      points: -lotteryCost.value,
      type: 'exchange'
    }
    pointRecords.value.push(record)

    // 使用提供的物品或根据概率进行抽奖
    const selectedItem = item || (() => {
      // 根据概率进行抽奖
      const random = Math.random() * 100
      let cumulativeProbability = 0

      for (const lotteryItem of lotteryItems.value) {
        cumulativeProbability += lotteryItem.probability
        if (random < cumulativeProbability) {
          return lotteryItem
        }
      }

      // 如果没有找到（理论上不会发生），返回安慰奖
      console.warn('抽奖异常：未找到匹配概率的物品，返回安慰奖')
      return {
        id: 'fallback-item',
        name: '安慰奖',
        description: '感谢参与！',
        rarity: ItemRarity.Common,
        probability: 100,
        effect: '+10 学习积分',
        icon: '🎁'
      }
    })()

    // 将抽到的物品添加到背包
    const backpackItem: BackpackItem = {
      id: `backpack-${Date.now()}`,
      originalId: selectedItem.id,
      name: selectedItem.name,
      description: selectedItem.description,
      acquiredDate: new Date().toISOString(),
      rarity: selectedItem.rarity,
      effect: selectedItem.effect,
      effectType: selectedItem.effectType,
      icon: selectedItem.icon
    }
    backpackItems.value.push(backpackItem)

    // 添加抽奖记录到lotteryRecords
    const lotteryRecord: LotteryRecord = {
      id: `lottery-${Date.now()}`,
      date: new Date().toISOString(),
      itemName: selectedItem.name,
      itemRarity: selectedItem.rarity
    }
    lotteryRecords.value.unshift(lotteryRecord)

    console.log(`抽奖成功：获得 ${selectedItem.rarity} 物品 ${selectedItem.name}`)
    return backpackItem
  }

  // 调整积分（管理模块使用） - 修正参数
  function adjustPoints(amount: number, description: string = '积分调整') {
    currentPoints.value = Math.max(0, currentPoints.value + amount)

    const record: PointRecord = {
      id: `record-${Date.now()}`,
      date: new Date().toISOString(),
      description: description,
      points: amount,
      type: 'exchange',
    }
    pointRecords.value.push(record)

    // 检查成就
    // 这里需要通过回调函数来检查成就
  }

  // 更新兑换项（管理模块使用）
  function updateExchangeItem(itemId: string, name: string, points: number, description: string) {
    const item = exchangeItems.value.find((i) => i.id === itemId)
    if (item) {
      item.name = name
      item.points = points
      item.description = description
      // 触发响应式更新
      exchangeItems.value = [...exchangeItems.value]
    }
  }

  // 添加兑换项（管理模块使用）
  function addExchangeItem(name: string, points: number, description: string) {
    const newItem: ExchangeItem = {
      id: `item-${Date.now()}`,
      name,
      points,
      description,
    }
    exchangeItems.value.push(newItem)
    // 触发响应式更新
    exchangeItems.value = [...exchangeItems.value]
  }

  // 删除兑换项（管理模块使用）
  function removeExchangeItem(itemId: string) {
    exchangeItems.value = exchangeItems.value.filter((item) => item.id !== itemId)
  }

  // 抽奖物品管理方法
  // 添加抽奖物品（管理模块使用）
  function addLotteryItem(name: string, description: string, rarity: ItemRarity, probability: number, effect: string) {
    const newItem: LotteryItem = {
      id: `lottery-${Date.now()}`,
      name,
      description,
      rarity,
      probability,
      effect,
      icon: '🎁'
    }
    lotteryItems.value.push(newItem)
    // 触发响应式更新
    lotteryItems.value = [...lotteryItems.value]
  }

  // 更新抽奖物品（管理模块使用）
  function updateLotteryItem(itemId: string, name: string, description: string, rarity: ItemRarity, probability: number, effect: string) {
    const item = lotteryItems.value.find((i) => i.id === itemId)
    if (item) {
      item.name = name
      item.description = description
      item.rarity = rarity
      item.probability = probability
      item.effect = effect
      // 触发响应式更新
      lotteryItems.value = [...lotteryItems.value]
    }
  }

  // 删除抽奖物品（管理模块使用）
  function removeLotteryItem(itemId: string) {
    lotteryItems.value = lotteryItems.value.filter((item) => item.id !== itemId)
  }

  // 设置抽奖消耗积分（管理模块使用）
  function setLotteryCost(cost: number) {
    lotteryCost.value = cost
  }

  return {
    currentPoints,
    pointRecords,
    exchangeItems,
    backpackItems,
    lotteryItems,
    lotteryRecords,
    lotteryCost,
    exchangeItem,
    useItemFromBackpack,
    drawLottery,
    adjustPoints,
    updateExchangeItem,
    addExchangeItem,
    removeExchangeItem,
    addLotteryItem,
    updateLotteryItem,
    removeLotteryItem,
    setLotteryCost
  }
}