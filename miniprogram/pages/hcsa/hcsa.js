Page({
  data: {
    questions: [],
    currentCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: 'firewall_basics', name: '防火墙基础' },
      { id: 'security_policy', name: '安全策略' },
      { id: 'nat', name: 'NAT' },
      { id: 'vpn', name: 'VPN' },
      { id: 'security_protection', name: '安全防护' },
      { id: 'system_mgmt', name: '系统管理' }
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
      // ===== 防火墙基础 =====
      {
        id: 1,
        category: 'firewall_basics',
        type: 'single',
        question: '山石网科防火墙使用的操作系统名称是什么？',
        options: [
          { label: 'A', text: 'FortiOS' },
          { label: 'B', text: 'StoneOS' },
          { label: 'C', text: 'PAN-OS' },
          { label: 'D', text: 'JunOS' }
        ],
        answer: ['B'],
        explanation: '山石网科（Hillstone）防火墙运行自研操作系统StoneOS，它是山石全系列安全产品的核心平台。'
      },
      {
        id: 2,
        category: 'firewall_basics',
        type: 'single',
        question: '在StoneOS中，接口、安全域、vswitch和vrouter的层级关系（从小到大）正确的是？',
        options: [
          { label: 'A', text: '接口 < 安全域 < vswitch < vrouter' },
          { label: 'B', text: '安全域 < 接口 < vrouter < vswitch' },
          { label: 'C', text: 'vswitch < vrouter < 安全域 < 接口' },
          { label: 'D', text: '接口 < vswitch < 安全域 < vrouter' }
        ],
        answer: ['A'],
        explanation: 'StoneOS的层级关系为：接口 < 安全域 < vswitch < vrouter。接口必须绑定到对应类型的安全域，安全域属于vswitch，vswitch属于vrouter。'
      },
      {
        id: 3,
        category: 'firewall_basics',
        type: 'single',
        question: '通过Console口登录山石网科防火墙时，默认的波特率是多少？',
        options: [
          { label: 'A', text: '4800' },
          { label: 'B', text: '9600' },
          { label: 'C', text: '19200' },
          { label: 'D', text: '115200' }
        ],
        answer: ['B'],
        explanation: '山石网科防火墙Console口的默认波特率为9600bps，默认用户名和密码均为hillstone。'
      },
      {
        id: 4,
        category: 'firewall_basics',
        type: 'single',
        question: '山石网科防火墙Console口的默认登录用户名和密码是什么？',
        options: [
          { label: 'A', text: 'admin / admin' },
          { label: 'B', text: 'root / root' },
          { label: 'C', text: 'hillstone / hillstone' },
          { label: 'D', text: 'firewall / firewall' }
        ],
        answer: ['C'],
        explanation: '山石网科防火墙出厂默认的Console登录凭据为用户名hillstone、密码hillstone。'
      },
      {
        id: 5,
        category: 'firewall_basics',
        type: 'single',
        question: '在StoneOS中，同一个安全域内接口间的访问，防火墙安全策略的默认动作是什么？',
        options: [
          { label: 'A', text: '允许所有流量' },
          { label: 'B', text: '拒绝所有流量' },
          { label: 'C', text: '仅允许ICMP流量' },
          { label: 'D', text: '仅允许HTTP流量' }
        ],
        answer: ['B'],
        explanation: '在StoneOS中，即使是同一安全域内不同接口间的互访，默认也是拒绝所有流量，需要手动配置域内放行策略。'
      },
      {
        id: 6,
        category: 'firewall_basics',
        type: 'single',
        question: 'StoneOS数据包处理流程中，当数据包进入防火墙时，首先执行的操作是什么？',
        options: [
          { label: 'A', text: '安全策略查询' },
          { label: 'B', text: 'NAT转换' },
          { label: 'C', text: '识别入接口并确定源安全域' },
          { label: 'D', text: '路由查询' }
        ],
        answer: ['C'],
        explanation: 'StoneOS处理数据包的第一步是识别入接口，从而确定源安全域。之后才依次进行合法性检查、会话查询、DNAT、路由、SNAT、安全策略等处理。'
      },
      {
        id: 7,
        category: 'firewall_basics',
        type: 'single',
        question: '在StoneOS的数据转发流程中，DNAT查找和SNAT查找的先后顺序是什么？',
        options: [
          { label: 'A', text: 'DNAT在SNAT之前' },
          { label: 'B', text: 'SNAT在DNAT之前' },
          { label: 'C', text: '同时进行' },
          { label: 'D', text: '取决于NAT规则配置顺序' }
        ],
        answer: ['A'],
        explanation: 'StoneOS数据包处理流程中，先进行目的NAT（DNAT）查找，然后进行路由查询，之后再进行源NAT（SNAT）查找。'
      },
      {
        id: 8,
        category: 'firewall_basics',
        type: 'single',
        question: '在StoneOS中，路由查询的优先级顺序（从高到低）正确的是？',
        options: [
          { label: 'A', text: '策略路由 > 源接口路由 > 源路由 > 目的路由 > ISP路由' },
          { label: 'B', text: '目的路由 > 策略路由 > 源路由 > ISP路由' },
          { label: 'C', text: '源路由 > 策略路由 > 目的路由 > ISP路由' },
          { label: 'D', text: 'ISP路由 > 策略路由 > 源路由 > 目的路由' }
        ],
        answer: ['A'],
        explanation: 'StoneOS路由查询的优先级为：策略路由(PBR) > 源接口路由(SIBR) > 源路由(SBR) > 目的路由(DBR) > ISP路由。'
      },
      {
        id: 9,
        category: 'firewall_basics',
        type: 'multiple',
        question: '山石网科防火墙支持的管理员角色有哪些？（多选）',
        options: [
          { label: 'A', text: '系统管理员' },
          { label: 'B', text: '系统操作员' },
          { label: 'C', text: '系统审计员' },
          { label: 'D', text: '只读管理员' }
        ],
        answer: ['A', 'B', 'C', 'D'],
        explanation: '山石网科防火墙支持四种管理员角色：系统管理员（全部权限）、系统操作员（不可看日志）、系统审计员（仅操作日志）和只读管理员。'
      },
      {
        id: 10,
        category: 'firewall_basics',
        type: 'single',
        question: '在StoneOS中，数据包最多可以通过多少个虚拟路由器（VR）？超出限制会怎样？',
        options: [
          { label: 'A', text: '最多2个VR，超限转发到默认路由' },
          { label: 'B', text: '最多3个VR，超限丢弃数据包' },
          { label: 'C', text: '最多5个VR，超限降低优先级' },
          { label: 'D', text: '无限制' }
        ],
        answer: ['B'],
        explanation: 'StoneOS限制数据包最多经过3个VR（Virtual Router），如果超过3个VR则直接丢弃该数据包。'
      },

      // ===== 安全策略 =====
      {
        id: 11,
        category: 'security_policy',
        type: 'single',
        question: '在山石网科防火墙中，安全策略的匹配顺序是什么？',
        options: [
          { label: 'A', text: '从下到上匹配' },
          { label: 'B', text: '随机匹配' },
          { label: 'C', text: '从上到下匹配' },
          { label: 'D', text: '按策略ID大小匹配' }
        ],
        answer: ['C'],
        explanation: '安全策略按列表从上到下的顺序逐条匹配，一旦匹配到某条策略就执行对应动作，不再继续匹配后续策略。'
      },
      {
        id: 12,
        category: 'security_policy',
        type: 'multiple',
        question: '山石网科防火墙安全策略支持的动作类型有哪些？（多选）',
        options: [
          { label: 'A', text: 'Permit（允许）' },
          { label: 'B', text: 'Deny（拒绝）' },
          { label: 'C', text: 'Tunnel（隧道）' },
          { label: 'D', text: 'WebAuth（Web认证）' }
        ],
        answer: ['A', 'B', 'C', 'D'],
        explanation: '山石网科防火墙安全策略支持五种动作：Permit（允许）、Deny（拒绝）、Tunnel（引入VPN隧道）、Fromtunnel（来自VPN隧道）和WebAuth（Web认证）。'
      },
      {
        id: 13,
        category: 'security_policy',
        type: 'single',
        question: '安全策略动作设为Tunnel时，该策略用于什么场景？',
        options: [
          { label: 'A', text: '允许普通Internet流量通过' },
          { label: 'B', text: '将匹配的流量引入VPN隧道传输' },
          { label: 'C', text: '拒绝并记录所有流量' },
          { label: 'D', text: '对用户进行Web认证' }
        ],
        answer: ['B'],
        explanation: 'Tunnel动作用于基于策略的VPN场景，将匹配的流量引入IPSec VPN隧道进行加密传输，通常用于本地到对端方向的策略。'
      },
      {
        id: 14,
        category: 'security_policy',
        type: 'single',
        question: '安全策略的Fromtunnel动作用于什么场景？',
        options: [
          { label: 'A', text: '本地到VPN对端的流量' },
          { label: 'B', text: 'VPN对端到本地的流量' },
          { label: 'C', text: '普通Internet访问流量' },
          { label: 'D', text: '管理平面的流量' }
        ],
        answer: ['B'],
        explanation: 'Fromtunnel动作用于基于策略的VPN场景，匹配从VPN对端到本地方向的解密后流量。与Tunnel动作配合使用，实现双向VPN通信。'
      },
      {
        id: 15,
        category: 'security_policy',
        type: 'single',
        question: '山石网科防火墙安全策略导入文件仅支持什么格式？',
        options: [
          { label: 'A', text: 'CSV格式' },
          { label: 'B', text: 'XML格式' },
          { label: 'C', text: 'DAT格式' },
          { label: 'D', text: 'JSON格式' }
        ],
        answer: ['C'],
        explanation: '山石网科防火墙的安全策略导入功能仅支持DAT格式文件。'
      },
      {
        id: 16,
        category: 'security_policy',
        type: 'single',
        question: '查看安全策略命中统计的StoneOS命令是什么？',
        options: [
          { label: 'A', text: 'show session count' },
          { label: 'B', text: 'show policy hit-count' },
          { label: 'C', text: 'show rule statistics' },
          { label: 'D', text: 'show access-list counter' }
        ],
        answer: ['B'],
        explanation: 'StoneOS使用show policy hit-count命令查看各安全策略的命中次数，便于分析策略使用情况和排查问题。'
      },
      {
        id: 17,
        category: 'security_policy',
        type: 'single',
        question: '在配置VPN安全策略时，如果勾选了"双向VPN策略"选项，系统会怎样处理？',
        options: [
          { label: 'A', text: '仅创建一条单向策略' },
          { label: 'B', text: '自动创建来回两条策略（Tunnel和Fromtunnel）' },
          { label: 'C', text: '需要手动再创建反向策略' },
          { label: 'D', text: '删除已有的VPN策略' }
        ],
        answer: ['B'],
        explanation: '在Web UI中勾选"双向VPN策略"后，系统会自动同时创建Tunnel（本地到对端）和Fromtunnel（对端到本地）两条策略，简化配置。'
      },
      {
        id: 18,
        category: 'security_policy',
        type: 'multiple',
        question: '山石网科下一代防火墙（NGFW）具备的核心功能包括哪些？（多选）',
        options: [
          { label: 'A', text: '数据转发' },
          { label: 'B', text: 'NAT地址转换' },
          { label: 'C', text: 'VPN虚拟专用网' },
          { label: 'D', text: '访问控制与QoS' }
        ],
        answer: ['A', 'B', 'C', 'D'],
        explanation: '山石网科NGFW是一款多功能安全设备，集成了数据转发、NAT、VPN、访问控制、QoS等核心网络安全功能。'
      },

      // ===== NAT =====
      {
        id: 19,
        category: 'nat',
        type: 'single',
        question: '在StoneOS中配置DNAT发布内网服务器时，安全策略中的源和目的地址应使用什么？',
        options: [
          { label: 'A', text: 'NAT转换后的公网地址' },
          { label: 'B', text: 'NAT转换前的真实地址' },
          { label: 'C', text: '防火墙管理地址' },
          { label: 'D', text: '广播地址' }
        ],
        answer: ['B'],
        explanation: '在山石网科防火墙中，发布服务器（DNAT）时，安全策略中的源和目的地址应使用NAT转换前的真实地址，而不是转换后的地址。'
      },
      {
        id: 20,
        category: 'nat',
        type: 'single',
        question: 'StoneOS中NAT规则的匹配顺序是怎样的？',
        options: [
          { label: 'A', text: '从下到上匹配' },
          { label: 'B', text: '随机匹配' },
          { label: 'C', text: '从上到下匹配' },
          { label: 'D', text: '按NAT ID大小匹配' }
        ],
        answer: ['C'],
        explanation: 'StoneOS中NAT规则与安全策略一样，按列表从上到下的顺序逐条匹配，命中后不再继续匹配后续规则。'
      },
      {
        id: 21,
        category: 'nat',
        type: 'single',
        question: '在StoneOS中，静态一对一BNAT与普通DNAT/SNAT的优先级关系是什么？',
        options: [
          { label: 'A', text: '普通DNAT/SNAT优先于BNAT' },
          { label: 'B', text: 'BNAT优先于普通DNAT/SNAT' },
          { label: 'C', text: '两者优先级完全相同' },
          { label: 'D', text: '取决于规则配置的先后顺序' }
        ],
        answer: ['B'],
        explanation: '在StoneOS数据处理流程中，系统先查找静态一对一BNAT规则，如果未命中再查找普通DNAT/SNAT规则，即BNAT优先级更高。'
      },
      {
        id: 22,
        category: 'nat',
        type: 'single',
        question: 'SNAT的dynamicport模式有什么特点？',
        options: [
          { label: 'A', text: '一对一地址映射，不转换端口' },
          { label: 'B', text: '将多个内网地址映射到一个或少量公网地址的不同端口' },
          { label: 'C', text: '仅支持TCP协议的地址转换' },
          { label: 'D', text: '每次转换分配一个固定端口' }
        ],
        answer: ['B'],
        explanation: 'dynamicport模式（端口地址转换PAT）可以将多个内部地址映射到一个或少量公网地址的不同端口，最大化利用公网地址资源。'
      },
      {
        id: 23,
        category: 'nat',
        type: 'multiple',
        question: '关于StoneOS中SNAT的描述，以下哪些是正确的？（多选）',
        options: [
          { label: 'A', text: 'SNAT用于将内部地址转换为公网地址' },
          { label: 'B', text: 'SNAT转换发生在路由查找之后' },
          { label: 'C', text: 'SNAT可以使用出接口IP（eif-ip）作为转换后地址' },
          { label: 'D', text: 'SNAT转换发生在DNAT之前' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: 'SNAT用于将内部私有地址转换为公网地址，在路由查找之后进行。配置中可以使用eif-ip关键字指定出接口IP作为转换后地址。SNAT在DNAT之后执行，而不是之前。'
      },
      {
        id: 24,
        category: 'nat',
        type: 'single',
        question: 'StoneOS中查看当前SNAT规则的命令是什么？',
        options: [
          { label: 'A', text: 'show nat source' },
          { label: 'B', text: 'show snat' },
          { label: 'C', text: 'display nat source' },
          { label: 'D', text: 'get snat rule' }
        ],
        answer: ['B'],
        explanation: 'StoneOS使用show snat命令查看当前配置的SNAT规则列表，对应地使用show dnat查看DNAT规则。'
      },

      // ===== VPN =====
      {
        id: 25,
        category: 'vpn',
        type: 'multiple',
        question: '山石网科防火墙支持哪些类型的VPN？（多选）',
        options: [
          { label: 'A', text: 'IPSec VPN' },
          { label: 'B', text: 'SSL VPN' },
          { label: 'C', text: 'L2TP VPN' },
          { label: 'D', text: 'MPLS VPN' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: '山石网科防火墙支持IPSec VPN、SSL VPN和L2TP三种VPN类型。MPLS VPN通常由运营商路由器实现，不属于防火墙VPN功能。'
      },
      {
        id: 26,
        category: 'vpn',
        type: 'single',
        question: 'IPSec VPN阶段一（ISAKMP）中，主模式和野蛮模式分别交换多少个报文？',
        options: [
          { label: 'A', text: '主模式3个，野蛮模式6个' },
          { label: 'B', text: '主模式6个，野蛮模式3个' },
          { label: 'C', text: '两者都是4个' },
          { label: 'D', text: '主模式4个，野蛮模式2个' }
        ],
        answer: ['B'],
        explanation: 'IPSec VPN阶段一中，主模式（Main Mode）交换6个报文，安全性更高；野蛮模式（Aggressive Mode）仅交换3个报文，协商更快但安全性略低。'
      },
      {
        id: 27,
        category: 'vpn',
        type: 'single',
        question: 'IPSec VPN第二阶段中的"感兴趣流"是指什么？',
        options: [
          { label: 'A', text: '所有经过防火墙的流量' },
          { label: 'B', text: '两端内网子网之间需要加密传输的流量' },
          { label: 'C', text: '仅HTTP和HTTPS协议的流量' },
          { label: 'D', text: '防火墙管理流量' }
        ],
        answer: ['B'],
        explanation: '感兴趣流（Interesting Traffic）由第二阶段ID定义，指VPN两端内网子网之间需要通过IPSec隧道加密传输的流量。'
      },
      {
        id: 28,
        category: 'vpn',
        type: 'single',
        question: '在山石网科防火墙中，基于路由的IPSec VPN需要创建什么类型的接口？',
        options: [
          { label: 'A', text: 'VLAN子接口' },
          { label: 'B', text: 'Loopback接口' },
          { label: 'C', text: 'Tunnel接口' },
          { label: 'D', text: 'Bridge接口' }
        ],
        answer: ['C'],
        explanation: '基于路由的IPSec VPN需要创建Tunnel接口并绑定IPSec隧道，然后配置静态路由将目的网段的下一跳指向该Tunnel接口，再配置普通Permit策略即可。'
      },
      {
        id: 29,
        category: 'vpn',
        type: 'multiple',
        question: '配置SSL VPN地址池时，需要满足哪些要求？（多选）',
        options: [
          { label: 'A', text: '地址池不能包含Tunnel网关IP' },
          { label: 'B', text: '地址池不能与现网IP冲突' },
          { label: 'C', text: 'Tunnel接口IP需与地址池同网段且不被地址池包含' },
          { label: 'D', text: '地址池可以使用任意IP地址段' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: 'SSL VPN地址池配置要求：不能包含Tunnel网关IP，不能与现网IP冲突，Tunnel接口IP需与地址池在同一网段但不被地址池包含。'
      },
      {
        id: 30,
        category: 'vpn',
        type: 'single',
        question: 'SSL VPN中实现分裂隧道（Split Tunnel），使特定流量走VPN隧道、其余走本地，需要配置什么？',
        options: [
          { label: 'A', text: '默认路由指向VPN隧道' },
          { label: 'B', text: 'split-tunnel-route精确路由' },
          { label: 'C', text: 'NAT转换规则' },
          { label: 'D', text: '全隧道模式' }
        ],
        answer: ['B'],
        explanation: '通过配置split-tunnel-route，可以指定哪些目的网段的流量走SSL VPN隧道，其余流量走用户本地网络出口，实现分裂隧道。'
      },
      {
        id: 31,
        category: 'vpn',
        type: 'single',
        question: '基于策略的IPSec VPN与基于路由的IPSec VPN的主要区别是什么？',
        options: [
          { label: 'A', text: '基于策略使用Tunnel/Fromtunnel动作，基于路由使用Tunnel接口和静态路由' },
          { label: 'B', text: '两者配置方式完全相同' },
          { label: 'C', text: '基于路由的VPN不支持数据加密' },
          { label: 'D', text: '基于策略的VPN不需要ISAKMP协商' }
        ],
        answer: ['A'],
        explanation: '基于策略的VPN通过安全策略的Tunnel/Fromtunnel动作引导流量进入隧道；基于路由的VPN创建Tunnel接口绑定IPSec，通过静态路由引导流量，策略只需Permit。'
      },
      {
        id: 32,
        category: 'vpn',
        type: 'single',
        question: 'IPSec VPN配置中，auto-connect选项的作用是什么？',
        options: [
          { label: 'A', text: '自动断开空闲的VPN连接' },
          { label: 'B', text: '设备启动或隧道中断后自动发起VPN隧道建立' },
          { label: 'C', text: '自动删除过期的VPN配置' },
          { label: 'D', text: '自动更新预共享密钥' }
        ],
        answer: ['B'],
        explanation: '开启auto-connect后，防火墙会在设备启动或VPN隧道中断后自动尝试与对端建立IPSec VPN连接，无需手动触发。'
      },

      // ===== 安全防护 =====
      {
        id: 33,
        category: 'security_protection',
        type: 'multiple',
        question: '在山石网科防火墙中，以下哪些功能开启后需要重启设备才能生效？（多选）',
        options: [
          { label: 'A', text: '病毒过滤（AV）' },
          { label: 'B', text: '入侵防御（IPS）' },
          { label: 'C', text: '沙箱检测' },
          { label: 'D', text: '僵尸网络检测' }
        ],
        answer: ['A', 'B', 'C', 'D'],
        explanation: '山石网科防火墙的病毒过滤、入侵防御（IPS）、沙箱和僵尸网络检测功能，开启或关闭后均需要重启设备才能生效。'
      },
      {
        id: 34,
        category: 'security_protection',
        type: 'multiple',
        question: '山石网科防火墙的沙箱功能支持检测哪些文件类型？（多选）',
        options: [
          { label: 'A', text: 'PE（Windows可执行文件）和APK（安卓应用包）' },
          { label: 'B', text: 'MS-Office文档和PDF文件' },
          { label: 'C', text: 'RAR和ZIP压缩包' },
          { label: 'D', text: 'JAR（Java归档文件）和SWF（Flash文件）' }
        ],
        answer: ['A', 'B', 'C', 'D'],
        explanation: '山石网科沙箱支持检测PE、APK、JAR、MS-Office、PDF、SWF、RAR、ZIP等多种常见文件类型。'
      },
      {
        id: 35,
        category: 'security_protection',
        type: 'single',
        question: '当IPS/AV服务许可证过期后，会发生什么？',
        options: [
          { label: 'A', text: '所有安全功能立即失效，停止检测' },
          { label: 'B', text: '无法升级特征库，但可继续使用当前版本的特征库' },
          { label: 'C', text: '设备无法正常启动' },
          { label: 'D', text: '自动降级为普通路由器模式' }
        ],
        answer: ['B'],
        explanation: '服务许可证过期后，IPS/AV功能仍可使用当前已下载的特征库版本继续检测，但无法从更新服务器下载升级新的特征库。'
      },
      {
        id: 36,
        category: 'security_protection',
        type: 'single',
        question: 'URL过滤功能中，自定义URL库和预定义URL库的优先级关系是什么？',
        options: [
          { label: 'A', text: '预定义URL库优先' },
          { label: 'B', text: '自定义URL库优先' },
          { label: 'C', text: '两者优先级相同，按配置顺序匹配' },
          { label: 'D', text: '由管理员手动指定优先级' }
        ],
        answer: ['B'],
        explanation: '山石网科防火墙的URL过滤中，自定义URL库优先于预定义URL库进行匹配，管理员可通过自定义库灵活覆盖预定义分类。'
      },
      {
        id: 37,
        category: 'security_protection',
        type: 'single',
        question: '为了对HTTPS加密流量进行URL过滤和内容检测，需要在安全策略中引用什么功能？',
        options: [
          { label: 'A', text: 'NAT转换规则' },
          { label: 'B', text: 'SSL代理（SSL-Proxy）Profile' },
          { label: 'C', text: 'VPN隧道配置' },
          { label: 'D', text: '端口镜像' }
        ],
        answer: ['B'],
        explanation: '要对HTTPS加密流量进行深度检测（包括URL过滤），需要创建SSL-Proxy Profile并在安全策略中引用，实现SSL/TLS解密后再检测。'
      },
      {
        id: 38,
        category: 'security_protection',
        type: 'multiple',
        question: '山石网科防火墙的文件过滤功能支持哪些协议？（多选）',
        options: [
          { label: 'A', text: 'HTTP-GET和HTTP-POST' },
          { label: 'B', text: 'POP3和SMTP' },
          { label: 'C', text: 'FTP' },
          { label: 'D', text: 'SSH' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: '文件过滤支持的协议包括HTTP-GET、HTTP-POST、POP3、SMTP和FTP。SSH属于加密管理协议，不在文件过滤协议范围内。'
      },
      {
        id: 39,
        category: 'security_protection',
        type: 'multiple',
        question: 'IPS/AV等安全功能的Profile可以在哪些位置调用？（多选）',
        options: [
          { label: 'A', text: '在安全域下调用' },
          { label: 'B', text: '在安全策略下调用' },
          { label: 'C', text: '在路由表中调用' },
          { label: 'D', text: '在NAT规则中调用' }
        ],
        answer: ['A', 'B'],
        explanation: 'IPS/AV等安全Profile可以在安全域下调用（对该域所有流量生效）或在安全策略下调用（仅对匹配策略的流量生效）。策略调用方式更灵活精细。'
      },
      {
        id: 40,
        category: 'security_protection',
        type: 'multiple',
        question: '山石网科防火墙的特征库更新服务器域名包括哪些？（多选）',
        options: [
          { label: 'A', text: 'update1.hillstonenet.com' },
          { label: 'B', text: 'update2.hillstonenet.com' },
          { label: 'C', text: 'update.fortinet.com' },
          { label: 'D', text: 'signatures.paloalto.com' }
        ],
        answer: ['A', 'B'],
        explanation: '山石网科防火墙使用update1.hillstonenet.com和update2.hillstonenet.com作为特征库更新服务器。其他选项属于其他厂商的更新服务器。'
      },

      // ===== 系统管理 =====
      {
        id: 41,
        category: 'system_mgmt',
        type: 'single',
        question: 'StoneOS支持多少种日志类型？',
        options: [
          { label: 'A', text: '8种' },
          { label: 'B', text: '10种' },
          { label: 'C', text: '12种' },
          { label: 'D', text: '15种' }
        ],
        answer: ['C'],
        explanation: 'StoneOS支持12种日志类型：事件、网络、配置、共享接入、威胁、会话、PBR、NAT、URL、文件过滤、内容过滤、上网行为审计。'
      },
      {
        id: 42,
        category: 'system_mgmt',
        type: 'multiple',
        question: '以下哪些日志类型在StoneOS中默认未启用，需要手动开启？（多选）',
        options: [
          { label: 'A', text: '会话日志' },
          { label: 'B', text: 'NAT日志' },
          { label: 'C', text: '上网行为审计日志' },
          { label: 'D', text: '事件日志' }
        ],
        answer: ['A', 'B', 'C'],
        explanation: '会话日志、NAT日志和上网行为审计日志默认未启用，需要管理员手动开启。事件日志等其他类型默认启用。'
      },
      {
        id: 43,
        category: 'system_mgmt',
        type: 'single',
        question: 'StoneOS中查看当前活跃会话的命令是什么？',
        options: [
          { label: 'A', text: 'show connection' },
          { label: 'B', text: 'show session' },
          { label: 'C', text: 'display session table' },
          { label: 'D', text: 'get session all' }
        ],
        answer: ['B'],
        explanation: 'StoneOS使用show session命令查看当前活跃的会话信息，包括源/目的地址、端口、协议等连接详情。'
      },
      {
        id: 44,
        category: 'system_mgmt',
        type: 'single',
        question: 'StoneOS中保存当前运行配置的命令是什么？',
        options: [
          { label: 'A', text: 'write memory' },
          { label: 'B', text: 'copy running-config startup-config' },
          { label: 'C', text: 'save' },
          { label: 'D', text: 'commit' }
        ],
        answer: ['C'],
        explanation: 'StoneOS使用save命令将当前运行配置保存到启动配置文件中，确保重启后配置不丢失。'
      },
      {
        id: 45,
        category: 'system_mgmt',
        type: 'single',
        question: 'StoneOS恢复出厂默认设置的命令是什么？',
        options: [
          { label: 'A', text: 'factory-reset' },
          { label: 'B', text: 'unset all' },
          { label: 'C', text: 'reset factory-default' },
          { label: 'D', text: 'clear config all' }
        ],
        answer: ['B'],
        explanation: 'StoneOS使用unset all命令可以清除所有用户配置，将设备恢复到出厂默认状态。'
      },
      {
        id: 46,
        category: 'system_mgmt',
        type: 'single',
        question: '系统操作员角色与系统管理员角色相比，主要的限制是什么？',
        options: [
          { label: 'A', text: '不能配置网络接口' },
          { label: 'B', text: '不能查看日志' },
          { label: 'C', text: '不能保存配置' },
          { label: 'D', text: '不能登录设备' }
        ],
        answer: ['B'],
        explanation: '系统操作员角色可以进行大部分系统配置操作，但不具备查看日志的权限。日志查看权限由系统管理员和系统审计员角色拥有。'
      },
      {
        id: 47,
        category: 'system_mgmt',
        type: 'single',
        question: '系统审计员角色可以操作的范围是什么？',
        options: [
          { label: 'A', text: '所有系统配置和策略管理' },
          { label: 'B', text: '仅操作日志相关功能' },
          { label: 'C', text: '安全策略和NAT配置' },
          { label: 'D', text: 'VPN和路由配置' }
        ],
        answer: ['B'],
        explanation: '系统审计员角色仅有操作日志相关的权限，用于日志审计和查看，不能进行系统配置、策略管理等操作。'
      },
      {
        id: 48,
        category: 'system_mgmt',
        type: 'multiple',
        question: 'StoneOS中可以通过哪些方式导出日志？（多选）',
        options: [
          { label: 'A', text: 'FTP' },
          { label: 'B', text: 'TFTP' },
          { label: 'C', text: 'USB直接导出' },
          { label: 'D', text: '通过redirect命令输出到远程服务器' }
        ],
        answer: ['A', 'B', 'D'],
        explanation: 'StoneOS支持通过FTP和TFTP方式导出日志，也可以使用show logging [type] | redirect tftp://ip/filename命令将日志导出到远程TFTP服务器。'
      },
      {
        id: 49,
        category: 'system_mgmt',
        type: 'single',
        question: '在StoneOS中，哪个功能可以基于源地址选择路由，实现多子网选择性转发？',
        options: [
          { label: 'A', text: '策略路由（PBR）' },
          { label: 'B', text: '源路由（SBR）' },
          { label: 'C', text: '默认路由' },
          { label: 'D', text: 'OSPF动态路由' }
        ],
        answer: ['B'],
        explanation: '源路由（Source-Based Routing）基于源地址来选择路由，可以实现不同子网或内网地址段使用不同出口线路的选择性转发。'
      },
      {
        id: 50,
        category: 'system_mgmt',
        type: 'single',
        question: '在StoneOS中进行IP-MAC绑定时，需要首先执行什么操作？',
        options: [
          { label: 'A', text: '开启DHCP服务' },
          { label: 'B', text: '关闭ARP自动学习（no arp-learning）' },
          { label: 'C', text: '配置NAT规则' },
          { label: 'D', text: '创建新的安全域' }
        ],
        answer: ['B'],
        explanation: '进行IP-MAC绑定前需要先关闭ARP自动学习（no arp-learning），然后可以进一步使用arp-disable-dynamic-entry禁用动态ARP表项，仅使用静态绑定。'
      }
    ];
  }
});
