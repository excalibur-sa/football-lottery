Page({
  data: {
    questions: [],
    currentCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: 'collaboration', name: '智能协作' },
      { id: 'network', name: 'IP网络' },
      { id: 'storage', name: '存储' },
      { id: 'computing', name: '计算' },
      { id: 'general', name: '综合' }
    ],
    answeredCount: 0,
    totalCount: 0
  },

  onLoad: function() {
    const questions = this._getQuestionBank().map(function(q, idx) {
      return Object.assign({}, q, {
        index: idx,
        showAnswer: false,
        selectedOptions: [],
        options: q.options.map(function(opt) {
          return Object.assign({}, opt, {
            checked: false,
            isCorrect: q.answer.indexOf(opt.label) !== -1
          });
        })
      });
    });
    this.setData({
      questions: questions,
      totalCount: questions.length
    });
  },

  /** 切换题目分类 */
  switchCategory: function(e) {
    var cat = e.currentTarget.dataset.cat;
    this.setData({ currentCategory: cat });
  },

  /** 单选题选择 */
  onRadioChange: function(e) {
    var qIdx = parseInt(e.currentTarget.dataset.qindex, 10);
    var value = e.detail.value;
    var questions = this.data.questions;
    var q = questions[qIdx];
    q.selectedOptions = [value];
    q.options.forEach(function(opt) {
      opt.checked = opt.label === value;
    });
    questions[qIdx] = q;
    this.setData({ questions: questions });
    this._updateAnsweredCount();
  },

  /** 多选题选择 */
  onCheckboxChange: function(e) {
    var qIdx = parseInt(e.currentTarget.dataset.qindex, 10);
    var values = e.detail.value;
    var questions = this.data.questions;
    var q = questions[qIdx];
    q.selectedOptions = values;
    q.options.forEach(function(opt) {
      opt.checked = values.indexOf(opt.label) !== -1;
    });
    questions[qIdx] = q;
    this.setData({ questions: questions });
    this._updateAnsweredCount();
  },

  /** 显示/隐藏答案 */
  toggleAnswer: function(e) {
    var qIdx = parseInt(e.currentTarget.dataset.qindex, 10);
    var key = 'questions[' + qIdx + '].showAnswer';
    var obj = {};
    obj[key] = !this.data.questions[qIdx].showAnswer;
    this.setData(obj);
  },

  /** 统计已作答题数 */
  _updateAnsweredCount: function() {
    var count = 0;
    this.data.questions.forEach(function(q) {
      if (q.selectedOptions && q.selectedOptions.length > 0) {
        count++;
      }
    });
    this.setData({ answeredCount: count });
  },

  /** HCSA认证题库数据 */
  _getQuestionBank: function() {
    return [
      // ===== 智能协作 (H19-119) =====
      {
        id: 1,
        category: 'collaboration',
        type: 'single',
        question: '以下哪个智能办公功能可以让用户同时显示多个内容？',
        options: [
          { label: 'A', text: '单窗口模式' },
          { label: 'B', text: '多窗口显示' },
          { label: 'C', text: '纯音频模式' },
          { label: 'D', text: '固定投屏' }
        ],
        answer: ['B'],
        explanation: '多窗口显示（Multi-window display）允许用户在同一屏幕上同时展示多个内容源，提升会议效率。'
      },
      {
        id: 2,
        category: 'collaboration',
        type: 'multiple',
        question: '企业可以从高质量视频会议中获得哪些收益？（多选）',
        options: [
          { label: 'A', text: '提升会议效率' },
          { label: 'B', text: '改善协作体验' },
          { label: 'C', text: '增加网络不稳定性' },
          { label: 'D', text: '增强沟通清晰度' }
        ],
        answer: ['A', 'B', 'D'],
        explanation: '高质量视频会议能提升效率、改善协作并增强沟通清晰度。增加网络不稳定性（C）显然是负面影响，不是收益。'
      },
      {
        id: 3,
        category: 'collaboration',
        type: 'single',
        question: '以下哪个智能办公功能主要用于提升会议的沉浸感？',
        options: [
          { label: 'A', text: '智能跟踪' },
          { label: 'B', text: '手动切换' },
          { label: 'C', text: '纯音频模式' },
          { label: 'D', text: '固定画面' }
        ],
        answer: ['A'],
        explanation: '智能跟踪（Intelligent tracking）可以自动追踪发言人，提供更自然的会议沉浸体验。'
      },
      {
        id: 4,
        category: 'collaboration',
        type: 'multiple',
        question: '以下哪些因素推动了智能协作行业的发展趋势？（多选）',
        options: [
          { label: 'A', text: '企业通信平台衰退' },
          { label: 'B', text: '对高清音视频的需求' },
          { label: 'C', text: 'AI辅助协作功能' },
          { label: 'D', text: '与办公和教育场景的融合' }
        ],
        answer: ['B', 'C', 'D'],
        explanation: '高清音视频需求、AI辅助功能和多场景融合是推动行业发展的关键因素。企业通信平台并未衰退。'
      },
      {
        id: 5,
        category: 'collaboration',
        type: 'single',
        question: '向注重安全的客户推介华为本地部署视频会议方案时，应重点强调哪个特点？',
        options: [
          { label: 'A', text: '依赖公网' },
          { label: 'B', text: '有限的扩展性' },
          { label: 'C', text: '本地数据管控与高安全性' },
          { label: 'D', text: '消费级加密' }
        ],
        answer: ['C'],
        explanation: '本地部署方案的核心卖点是数据保存在客户本地，实现高安全性的数据管控。'
      },
      {
        id: 6,
        category: 'collaboration',
        type: 'single',
        question: '智能办公解决方案的核心销售价值是什么？',
        options: [
          { label: 'A', text: '降低协作效率' },
          { label: 'B', text: '提升会议生产力' },
          { label: 'C', text: '增加复杂度' },
          { label: 'D', text: '需要手动设备管理' }
        ],
        answer: ['B'],
        explanation: '智能办公方案的核心价值在于提升会议生产力，帮助企业降本增效。'
      },
      {
        id: 7,
        category: 'collaboration',
        type: 'multiple',
        question: '华为智慧教育解决方案包含哪些场景？（多选）',
        options: [
          { label: 'A', text: '数字课堂' },
          { label: 'B', text: '混合式学习' },
          { label: 'C', text: '协作教室' },
          { label: 'D', text: '娱乐直播' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: '华为智慧教育方案聚焦数字课堂、混合式学习和协作教室三大核心教育场景。'
      },
      {
        id: 8,
        category: 'collaboration',
        type: 'single',
        question: '视频会议系统在故障期间仍能继续运行，这体现了系统的哪种特性？',
        options: [
          { label: 'A', text: '可扩展性' },
          { label: 'B', text: '可靠性' },
          { label: 'C', text: '互操作性' },
          { label: 'D', text: '可移植性' }
        ],
        answer: ['B'],
        explanation: '在故障情况下仍能持续运行是系统可靠性（Reliability）的核心表现。'
      },
      {
        id: 9,
        category: 'collaboration',
        type: 'single',
        question: 'BYOM在智能办公环境中实现了什么功能？',
        options: [
          { label: 'A', text: '只能使用华为终端' },
          { label: 'B', text: '仅支持有线会议' },
          { label: 'C', text: '取消会议系统' },
          { label: 'D', text: '用户可携带自己的会议平台' }
        ],
        answer: ['D'],
        explanation: 'BYOM（Bring Your Own Meeting）允许用户使用自己偏好的会议平台接入华为智能办公设备。'
      },

      // ===== IP网络 =====
      {
        id: 10,
        category: 'network',
        type: 'single',
        question: '在华为园区网络解决方案中，以下哪个设备通常作为接入层设备？',
        options: [
          { label: 'A', text: '核心交换机' },
          { label: 'B', text: '防火墙' },
          { label: 'C', text: 'PoE交换机' },
          { label: 'D', text: '路由器' }
        ],
        answer: ['C'],
        explanation: 'PoE交换机通常部署在接入层，为终端设备（如AP、IP电话等）提供网络接入和供电。'
      },
      {
        id: 11,
        category: 'network',
        type: 'multiple',
        question: '华为CloudEngine系列交换机的主要优势包括哪些？（多选）',
        options: [
          { label: 'A', text: '高性能转发能力' },
          { label: 'B', text: '智能运维iMaster NCE管理' },
          { label: 'C', text: '仅支持二层组网' },
          { label: 'D', text: '丰富的安全防护特性' }
        ],
        answer: ['A', 'B', 'D'],
        explanation: 'CloudEngine交换机具备高性能转发、iMaster NCE智能管理和丰富安全特性。它支持二层和三层组网，并非"仅支持二层"。'
      },
      {
        id: 12,
        category: 'network',
        type: 'single',
        question: '在SD-WAN解决方案中，CPE设备的主要作用是什么？',
        options: [
          { label: 'A', text: '仅用于无线接入' },
          { label: 'B', text: '作为分支站点的广域网接入设备' },
          { label: 'C', text: '替代所有核心路由器' },
          { label: 'D', text: '仅用于防火墙功能' }
        ],
        answer: ['B'],
        explanation: 'CPE（Customer Premises Equipment）是部署在客户分支站点的广域网接入设备，实现分支到总部/云的互联。'
      },
      {
        id: 13,
        category: 'network',
        type: 'single',
        question: '以下关于VXLAN技术的描述，哪个是正确的？',
        options: [
          { label: 'A', text: '只能在二层网络中使用' },
          { label: 'B', text: '最多支持4096个网络分段' },
          { label: 'C', text: '通过MAC-in-UDP封装实现大二层网络扩展' },
          { label: 'D', text: '不支持跨数据中心通信' }
        ],
        answer: ['C'],
        explanation: 'VXLAN使用MAC-in-UDP封装技术，可跨三层网络扩展二层域，支持最多1600万个网络分段（24位VNI）。'
      },
      {
        id: 14,
        category: 'network',
        type: 'multiple',
        question: '华为Wi-Fi 7 AP产品的主要技术特征包括哪些？（多选）',
        options: [
          { label: 'A', text: 'MLO（多链路操作）' },
          { label: 'B', text: '4096-QAM调制' },
          { label: 'C', text: '仅支持2.4GHz频段' },
          { label: 'D', text: '更宽的320MHz频宽' }
        ],
        answer: ['A', 'B', 'D'],
        explanation: 'Wi-Fi 7（802.11be）的核心技术包括MLO多链路操作、4096-QAM高阶调制和320MHz超宽频段。Wi-Fi 7支持多频段，并非仅2.4GHz。'
      },

      // ===== 存储 =====
      {
        id: 15,
        category: 'storage',
        type: 'single',
        question: '华为OceanStor全闪存存储系统的核心竞争优势主要体现在哪个方面？',
        options: [
          { label: 'A', text: '仅支持SAS硬盘' },
          { label: 'B', text: '端到端NVMe架构实现极致性能' },
          { label: 'C', text: '只能用于备份场景' },
          { label: 'D', text: '不支持数据缩减' }
        ],
        answer: ['B'],
        explanation: '华为OceanStor采用端到端NVMe架构，从控制器到硬盘全链路NVMe协议，实现极低时延和极致性能。'
      },
      {
        id: 16,
        category: 'storage',
        type: 'multiple',
        question: '以下哪些是华为数据保护解决方案的核心组件？（多选）',
        options: [
          { label: 'A', text: 'OceanProtect备份存储' },
          { label: 'B', text: 'HyperSnap快照技术' },
          { label: 'C', text: 'HyperReplication远程复制' },
          { label: 'D', text: '仅支持本地备份' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: 'OceanProtect提供专业备份存储、HyperSnap提供本地快照保护、HyperReplication提供跨站点远程容灾复制。华为方案支持本地+远程多级保护。'
      },
      {
        id: 17,
        category: 'storage',
        type: 'single',
        question: '在存储系统中，RAID 2.0+技术相比传统RAID的核心优势是什么？',
        options: [
          { label: 'A', text: '不需要磁盘冗余' },
          { label: 'B', text: '将数据分散到资源池内所有硬盘，提升重构速度' },
          { label: 'C', text: '仅支持RAID 5' },
          { label: 'D', text: '减少存储容量' }
        ],
        answer: ['B'],
        explanation: 'RAID 2.0+将数据块分散到存储池中所有硬盘上，当硬盘故障时可以利用所有硬盘并行重构，大幅缩短重构时间。'
      },
      {
        id: 18,
        category: 'storage',
        type: 'single',
        question: '华为OceanStor分布式存储产品主要应用于哪类场景？',
        options: [
          { label: 'A', text: '仅小型办公室文件共享' },
          { label: 'B', text: '大数据分析、AI训练和海量非结构化数据存储' },
          { label: 'C', text: '仅数据库备份' },
          { label: 'D', text: '仅桌面虚拟化' }
        ],
        answer: ['B'],
        explanation: '华为OceanStor分布式存储专为大数据分析、AI训练和海量非结构化数据场景设计，支持EB级容量和高并发。'
      },

      // ===== 计算 =====
      {
        id: 19,
        category: 'computing',
        type: 'single',
        question: '华为FusionServer Pro智能服务器的核心差异化特性是什么？',
        options: [
          { label: 'A', text: '仅支持单路配置' },
          { label: 'B', text: '搭载华为自研BMC智能管理芯片' },
          { label: 'C', text: '不支持GPU扩展' },
          { label: 'D', text: '仅支持Linux操作系统' }
        ],
        answer: ['B'],
        explanation: '华为FusionServer Pro搭载自研BMC管理芯片，实现智能故障诊断、智能节能和智能发现等差异化特性。'
      },
      {
        id: 20,
        category: 'computing',
        type: 'multiple',
        question: '以下哪些是华为FusionCompute虚拟化平台的组件？（多选）',
        options: [
          { label: 'A', text: 'CNA（计算节点代理）' },
          { label: 'B', text: 'VRM（虚拟资源管理器）' },
          { label: 'C', text: 'FusionStorage' },
          { label: 'D', text: 'eBackup' }
        ],
        answer: ['A', 'B'],
        explanation: 'FusionCompute由CNA（Computing Node Agent，承载虚拟机运行）和VRM（Virtual Resource Manager，管理资源调度）两个核心组件构成。'
      },
      {
        id: 21,
        category: 'computing',
        type: 'single',
        question: '在华为鲲鹏计算生态中，鲲鹏处理器基于什么架构？',
        options: [
          { label: 'A', text: 'x86架构' },
          { label: 'B', text: 'ARM架构' },
          { label: 'C', text: 'MIPS架构' },
          { label: 'D', text: 'RISC-V架构' }
        ],
        answer: ['B'],
        explanation: '华为鲲鹏处理器基于ARM架构设计，具有高性能、低功耗的特点，适用于多样化计算场景。'
      },
      {
        id: 22,
        category: 'computing',
        type: 'single',
        question: '华为Atlas AI计算平台的核心AI处理器是什么？',
        options: [
          { label: 'A', text: 'Intel Xeon' },
          { label: 'B', text: 'NVIDIA A100' },
          { label: 'C', text: '华为昇腾（Ascend）处理器' },
          { label: 'D', text: 'AMD EPYC' }
        ],
        answer: ['C'],
        explanation: '华为Atlas AI计算平台搭载自研昇腾（Ascend）AI处理器，提供强大的AI训练和推理算力。'
      },

      // ===== 综合 =====
      {
        id: 23,
        category: 'general',
        type: 'single',
        question: 'HCSA认证在华为认证体系中属于哪个级别？',
        options: [
          { label: 'A', text: '工程师级别（相当于HCIA）' },
          { label: 'B', text: '售前专家级别（L2）' },
          { label: 'C', text: '高级专家级别（L3）' },
          { label: 'D', text: '架构师级别' }
        ],
        answer: ['B'],
        explanation: 'HCSA（Huawei Certified Specialist Associate）是华为售前认证体系中的L2级别认证，面向具备一定产品方案知识的售前工程师。'
      },
      {
        id: 24,
        category: 'general',
        type: 'multiple',
        question: '华为ICT基础设施产品组合包含以下哪些领域？（多选）',
        options: [
          { label: 'A', text: '数据通信（路由器、交换机）' },
          { label: 'B', text: '数据存储' },
          { label: 'C', text: '服务器与计算' },
          { label: 'D', text: '云计算与虚拟化' }
        ],
        answer: ['A', 'B', 'C', 'D'],
        explanation: '华为ICT基础设施覆盖数据通信、存储、计算和云计算等全领域，提供端到端的ICT解决方案。'
      },
      {
        id: 25,
        category: 'general',
        type: 'single',
        question: '在售前方案设计中，TCO（总拥有成本）分析不包含以下哪项？',
        options: [
          { label: 'A', text: '设备采购成本' },
          { label: 'B', text: '运维人力成本' },
          { label: 'C', text: '能耗与机房成本' },
          { label: 'D', text: '竞争对手利润率' }
        ],
        answer: ['D'],
        explanation: 'TCO包括设备采购、运维人力、能耗机房等客户实际支出成本。竞争对手利润率不属于TCO分析范畴。'
      },
      {
        id: 26,
        category: 'general',
        type: 'single',
        question: '华为售前解决方案设计的"三层架构"通常指什么？',
        options: [
          { label: 'A', text: '硬件层、软件层、服务层' },
          { label: 'B', text: '接入层、汇聚层、核心层' },
          { label: 'C', text: '感知层、平台层、应用层' },
          { label: 'D', text: '前端、中间件、数据库' }
        ],
        answer: ['B'],
        explanation: '在网络方案设计中，"三层架构"通常指接入层（Access）、汇聚层（Aggregation）和核心层（Core）的经典网络分层设计。'
      },
      {
        id: 27,
        category: 'general',
        type: 'multiple',
        question: '华为售前技术服务的典型交付物包括哪些？（多选）',
        options: [
          { label: 'A', text: '技术方案书' },
          { label: 'B', text: 'BOM清单（物料清单）' },
          { label: 'C', text: '竞争分析报告' },
          { label: 'D', text: '项目验收报告' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: '售前阶段的典型交付物包括技术方案书、BOM清单和竞争分析报告。项目验收报告属于交付/售后阶段。'
      },
      {
        id: 28,
        category: 'network',
        type: 'single',
        question: '在华为防火墙产品中，以下哪项不属于下一代防火墙（NGFW）的核心功能？',
        options: [
          { label: 'A', text: '应用识别与控制' },
          { label: 'B', text: '入侵防御系统（IPS）' },
          { label: 'C', text: '数据库查询优化' },
          { label: 'D', text: '反病毒检测' }
        ],
        answer: ['C'],
        explanation: '下一代防火墙的核心功能包括应用识别、IPS入侵防御和反病毒等安全能力。数据库查询优化属于数据库领域，与防火墙无关。'
      },
      {
        id: 29,
        category: 'storage',
        type: 'single',
        question: '华为数据中心灾备方案中，RPO=0表示什么含义？',
        options: [
          { label: 'A', text: '恢复时间为零' },
          { label: 'B', text: '数据零丢失' },
          { label: 'C', text: '零成本投入' },
          { label: 'D', text: '零维护需求' }
        ],
        answer: ['B'],
        explanation: 'RPO（Recovery Point Objective）为0表示灾备切换时数据零丢失。RTO（Recovery Time Objective）才是指恢复时间。'
      },
      {
        id: 30,
        category: 'computing',
        type: 'multiple',
        question: '华为数据中心能耗管理方案关注的关键指标包括哪些？（多选）',
        options: [
          { label: 'A', text: 'PUE（电源使用效率）' },
          { label: 'B', text: '服务器利用率' },
          { label: 'C', text: '制冷系统效率' },
          { label: 'D', text: '办公区照明亮度' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: '数据中心能耗管理重点关注PUE、服务器利用率和制冷效率。办公区照明不属于数据中心能耗管理核心关注范畴。'
      }
    ];
  }
});
