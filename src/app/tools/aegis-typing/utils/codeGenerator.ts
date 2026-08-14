// ============================================================
// aegisTyping — Infinite Realistic Code Generator Engine
// Supports 16 Programming Languages with real syntax tokens,
// keywords, brackets, operators, types, and authentic snippets.
// ============================================================

export type SupportedCodeLang =
  | "js"
  | "ts"
  | "py"
  | "html"
  | "cpp"
  | "cs"
  | "rust"
  | "go"
  | "java"
  | "sql"
  | "php"
  | "swift"
  | "kotlin"
  | "bash"
  | "dart"
  | "ruby";

export interface CodeLangMeta {
  id: SupportedCodeLang;
  label: string;
  name: string;
  badge: string;
}

export const CODE_LANGUAGES: CodeLangMeta[] = [
  { id: "js", label: "JavaScript", name: "JavaScript", badge: "JS" },
  { id: "ts", label: "TypeScript", name: "TypeScript", badge: "TS" },
  { id: "py", label: "Python", name: "Python", badge: "PY" },
  { id: "html", label: "HTML & CSS", name: "HTML & CSS", badge: "HTML" },
  { id: "cpp", label: "C++", name: "C++", badge: "C++" },
  { id: "cs", label: "C#", name: "C#", badge: "C#" },
  { id: "rust", label: "Rust", name: "Rust", badge: "RS" },
  { id: "go", label: "Go", name: "Go", badge: "GO" },
  { id: "java", label: "Java", name: "Java", badge: "JAVA" },
  { id: "sql", label: "SQL", name: "SQL", badge: "SQL" },
  { id: "php", label: "PHP", name: "PHP", badge: "PHP" },
  { id: "swift", label: "Swift", name: "Swift", badge: "SWIFT" },
  { id: "kotlin", label: "Kotlin", name: "Kotlin", badge: "KT" },
  { id: "bash", label: "Bash / Shell", name: "Bash", badge: "SH" },
  { id: "dart", label: "Dart / Flutter", name: "Dart", badge: "DART" },
  { id: "ruby", label: "Ruby", name: "Ruby", badge: "RB" },
];

const SNIPPETS: Record<SupportedCodeLang, string[]> = {
  js: [
    "async function fetchUserData(userId, options = {}) {",
    "const response = await fetch(`/api/v1/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });",
    "if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);",
    "const payload = await response.json();",
    "return payload.data.filter((item) => item.isActive && !item.isDeleted);",
    "const [state, setState] = useState({ count: 0, loading: false, error: null });",
    "useEffect(() => { const timer = setInterval(() => tick(), 1000); return () => clearInterval(timer); }, []);",
    "const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);",
    "export const debounce = (fn, delay = 300) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };",
    "const aggregated = items.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.price * curr.quantity }), {});",
    "const result = await Promise.all(urls.map((url) => fetch(url).then((r) => r.json())));",
    "const sorted = [...users].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));",
    "const { id, username, email = 'default@domain.com', ...rest } = userProfile;",
    "try { await db.collection('logs').insertOne({ timestamp: Date.now(), action: 'LOGIN_SUCCESS' }); } catch (err) { console.error('Log failed:', err); }",
    "const formatCurrency = (val, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);",
    "const eventEmitter = new CustomEvent('aegis:state_update', { detail: { timestamp: performance.now(), payload } });",
  ],
  ts: [
    "interface UserProfile<T = Record<string, unknown>> { id: string; name: string; email: string; metadata: T; readonly createdAt: Date; }",
    "type ApiResponse<T> = { data: T; status: number; message: string; success: boolean };",
    "export async function queryRecords<T extends { id: string }>(table: string, filter: Partial<T>): Promise<T[]> {",
    "const result = await db.from<T>(table).select('*').match(filter);",
    "if (result.error) throw new DatabaseException(result.error.message);",
    "return result.data ?? [];",
    "type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };",
    "export const createHandler = <Req, Res>(handler: (req: Req) => Promise<Res>) => async (req: Req): Promise<Res> => { return await handler(req); };",
    "enum HttpStatus { OK = 200, CREATED = 201, BAD_REQUEST = 400, UNAUTHORIZED = 401, NOT_FOUND = 404, INTERNAL_ERROR = 500 }",
    "export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;",
    "const payload: Readonly<UserSession> = Object.freeze({ token: 'xyz_secret', expiresAt: Date.now() + 3600000, roles: ['admin', 'editor'] });",
    "export type ExtractProps<TComponent> = TComponent extends React.ComponentType<infer P> ? P : never;",
    "export type Nullable<T> = { [K in keyof T]: T[K] | null };",
  ],
  py: [
    "def calculate_moving_average(data: list[float], window_size: int = 5) -> list[float]:",
    "    if not data or window_size <= 0: return []",
    "    return [sum(data[i : i + window_size]) / window_size for i in range(len(data) - window_size + 1)]",
    "class RateLimiter:",
    "    def __init__(self, max_requests: int = 100, window_seconds: float = 60.0) -> None:",
    "        self.max_requests = max_requests",
    "        self.window = window_seconds",
    "        self._history: dict[str, list[float]] = defaultdict(list)",
    "async def fetch_session(user_id: str, redis_client: aioredis.Redis) -> Optional[dict]:",
    "    raw = await redis_client.get(f'session:{user_id}')",
    "    return json.loads(raw) if raw else None",
    "with open(file_path, mode='r', encoding='utf-8') as stream:",
    "    records = [json.loads(line) for line in stream if line.strip()]",
    "formatted = {k: v.strip().lower() for k, v in raw_dict.items() if v is not None}",
    "@dataclass(frozen=True, slots=True)",
    "class MetricRecord: name: str; value: float; timestamp: int = field(default_factory=time.time_ns)",
    "@app.get('/api/v2/stats', response_model=StatsResponse)",
    "async def get_system_stats(user: AuthenticatedUser = Depends(get_current_user)):",
  ],
  html: [
    "<div className=\"flex items-center justify-between px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl\">",
    "<button type=\"button\" onClick={handleAction} disabled={isLoading} className=\"px-5 py-2.5 text-sm font-semibold rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30\">",
    "<svg className=\"w-5 h-5 text-indigo-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M5 13l4 4L19 7\" /></svg>",
    "<input type=\"text\" placeholder=\"Search components...\" className=\"w-full px-4 py-2 text-sm bg-neutral-900/80 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none\" />",
    ".card-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; backdrop-filter: blur(20px); }",
    "@media (min-width: 1024px) { .dashboard-layout { grid-template-columns: 280px 1fr; } }",
    ".neon-glow { box-shadow: 0 0 25px -5px rgba(34, 211, 238, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15); }",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\" />",
  ],
  cpp: [
    "template <typename T, typename Alloc = std::allocator<T>>",
    "class ThreadSafeQueue { private: mutable std::mutex mtx_; std::queue<T> queue_; std::condition_variable cv_;",
    "public: void push(T value) { { std::lock_guard<std::mutex> lock(mtx_); queue_.push(std::move(value)); } cv_.notify_one(); } };",
    "auto result = std::transform(vec.begin(), vec.end(), std::back_inserter(dest), [](const auto& item) { return item * 2; });",
    "std::unique_ptr<SocketConnection> conn = std::make_unique<SocketConnection>(\"127.0.0.1\", 8080);",
    "constexpr size_t BUFFER_SIZE = 1024 * 1024;",
    "std::vector<int> sorted_indices(indices.size());",
    "std::iota(sorted_indices.begin(), sorted_indices.end(), 0);",
    "std::sort(sorted_indices.begin(), sorted_indices.end(), [&](size_t i, size_t j) { return weights[i] > weights[j]; });",
  ],
  cs: [
    "public async Task<ActionResult<ApiResponse<T>>> GetEntityByIdAsync(Guid entityId, CancellationToken cancellationToken = default)",
    "using var transaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);",
    "var query = from u in _dbContext.Users.AsNoTracking() where u.IsActive && u.Role == UserRoles.Administrator orderby u.CreatedAt descending select u;",
    "public record UserProfileDto(Guid Id, string Username, string Email, IReadOnlyList<string> Permissions);",
    "services.AddHttpClient<IGatewayService, GatewayService>(client => { client.BaseAddress = new Uri(configuration[\"GatewayUrl\"]); client.Timeout = TimeSpan.FromSeconds(30); });",
    "return entities.GroupBy(x => x.CategoryId).ToDictionary(g => g.Key, g => g.OrderByDescending(x => x.Score).Take(5).ToList());",
  ],
  rust: [
    "pub async fn handle_stream<T: Stream<Item = Result<Bytes, Error>> + Unpin>(mut stream: T) -> Result<Vec<u8>, AppError> {",
    "let mut buffer = Vec::with_capacity(1024 * 64);",
    "while let Some(chunk) = stream.next().await { buffer.extend_from_slice(&chunk.map_err(AppError::StreamError)?); }",
    "Ok(buffer) }",
    "match self.status { Status::Ready(val) => write!(f, \"Ready: {}\", val), Status::Pending => write!(f, \"Pending\"), Status::Failed(err) => write!(f, \"Err: {}\", err), }",
    "let shared_state = Arc::new(RwLock::new(HashMap::<String, WebSocketSession>::new()));",
    "#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]",
    "pub struct Config { pub host: String, pub port: u16, pub max_connections: usize, pub workers: u8 }",
  ],
  go: [
    "func (s *Server) HandleRequest(w http.ResponseWriter, r *http.Request) {",
    "ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)",
    "defer cancel()",
    "data, err := s.service.FetchPayload(ctx, r.URL.Query().Get(\"id\"))",
    "if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError); return }",
    "w.Header().Set(\"Content-Type\", \"application/json\")",
    "if err := json.NewEncoder(w).Encode(data); err != nil { log.Printf(\"encode error: %v\", err) } }",
    "type MetricPayload struct { Timestamp int64 `json:\"ts\"` Name string `json:\"name\"` Value float64 `json:\"val\"` }",
    "go func(ch <-chan Task) { for task := range ch { task.Execute() } }(taskChannel)",
  ],
  java: [
    "@RestController",
    "@RequestMapping(\"/api/v3/orders\")",
    "public class OrderController { private final OrderService orderService; public OrderController(OrderService orderService) { this.orderService = orderService; }",
    "@GetMapping(\"/{orderId}\")",
    "public ResponseEntity<OrderDto> getOrderById(@PathVariable(\"orderId\") UUID orderId) {",
    "return orderService.findOrder(orderId).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }",
    "List<String> activeNames = users.stream().filter(User::isActive).map(User::getUsername).sorted().collect(Collectors.toList());",
    "CompletableFuture<Void> allTasks = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));",
  ],
  sql: [
    "SELECT u.id, u.username, COUNT(o.id) AS total_orders, SUM(o.amount) AS total_spent, RANK() OVER (ORDER BY SUM(o.amount) DESC) AS rank_tier",
    "FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE o.status = 'COMPLETED' AND o.created_at >= NOW() - INTERVAL '30 days'",
    "GROUP BY u.id, u.username HAVING COUNT(o.id) >= 5 ORDER BY total_spent DESC LIMIT 50;",
    "WITH monthly_revenue AS ( SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount) AS revenue FROM transactions GROUP BY 1 )",
    "SELECT month, revenue, LAG(revenue, 1) OVER (ORDER BY month) AS prev_month_revenue FROM monthly_revenue;",
    "CREATE INDEX CONCURRENTLY idx_users_email_active ON users (email) WHERE is_active = TRUE;",
  ],
  php: [
    "public function registerUser(RegisterUserRequest $request): JsonResponse {",
    "    $validated = $request->validated();",
    "    DB::beginTransaction();",
    "    try {",
    "        $user = User::create(['name' => $validated['name'], 'email' => strtolower($validated['email']), 'password' => Hash::make($validated['password'])]);",
    "        event(new UserRegisteredEvent($user));",
    "        DB::commit();",
    "        return response()->json(['success' => true, 'data' => new UserResource($user)], 201);",
    "    } catch (\\Throwable $e) {",
    "        DB::rollBack();",
    "        Log::error('Registration failed: ' . $e->getMessage());",
    "        return response()->json(['success' => false, 'error' => 'Registration error'], 500);",
    "    }",
    "}",
    "$status = match ($code) { 200, 201 => 'success', 400, 422 => 'validation_error', 401, 403 => 'forbidden', default => 'server_error' };",
  ],
  swift: [
    "func fetchUserProfile(userId: String) async throws -> UserProfile {",
    "    guard let url = URL(string: \"https://api.everythinghub.com.tr/v1/users/\\(userId)\") else { throw NetworkError.invalidURL }",
    "    var request = URLRequest(url: url)",
    "    request.httpMethod = \"GET\"",
    "    request.setValue(\"Bearer \\(self.authToken)\", forHTTPHeaderField: \"Authorization\")",
    "    let (data, response) = try await URLSession.shared.data(for: request)",
    "    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else { throw NetworkError.serverError }",
    "    return try JSONDecoder().decode(UserProfile.self, from: data)",
    "}",
    "struct UserProfile: Identifiable, Codable, Sendable { let id: String; let username: String; let email: String; let avatarUrl: URL? }",
    "@StateObject private var viewModel = WorkspaceViewModel()",
  ],
  kotlin: [
    "suspend fun fetchCustomerDetails(customerId: String): Result<CustomerResponse> = withContext(Dispatchers.IO) {",
    "    try {",
    "        val response = apiService.getCustomer(customerId)",
    "        if (response.isSuccessful && response.body() != null) {",
    "            Result.success(response.body()!!)",
    "        } else {",
    "            Result.failure(ApiException(response.code(), response.message()))",
    "        }",
    "    } catch (e: Exception) { Result.failure(e) }",
    "}",
    "data class UserState(val isLoading: Boolean = false, val data: List<Item> = emptyList(), val error: String? = null)",
    "sealed interface UiEvent { data class ShowToast(val msg: String) : UiEvent; object NavigateHome : UiEvent }",
  ],
  bash: [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "readonly APP_DIR=\"/var/www/everythinghub\"",
    "readonly LOG_FILE=\"/var/log/deploy_$(date +%Y%m%d_%H%M%S).log\"",
    "if [[ ! -d \"$APP_DIR\" ]]; then echo \"Error: Directory not found\" >&2; exit 1; fi",
    "find . -type f -name \"*.ts\" -not -path \"*/node_modules/*\" | xargs -P 4 eslint --fix",
    "docker build -t everythinghub:latest -f ./Dockerfile --build-arg NODE_ENV=production .",
    "curl -sSf -X POST -H \"Authorization: Bearer ${API_SECRET}\" \"https://api.everythinghub.com.tr/v1/health\" | jq .",
  ],
  dart: [
    "class UserProfileCard extends StatelessWidget {",
    "  final UserModel user;",
    "  final VoidCallback onTap;",
    "  const UserProfileCard({Key? key, required this.user, required this.onTap}) : super(key: key);",
    "  @override Widget build(BuildContext context) {",
    "    return Container(margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(16)), child: ListTile(title: Text(user.name), subtitle: Text(user.email), onTap: onTap));",
    "  }",
    "}",
    "Future<List<Article>> getLatestArticles() async => await repository.fetchFeed();",
  ],
  ruby: [
    "class OrdersController < ApplicationController",
    "  before_action :authenticate_user!",
    "  def index",
    "    @orders = current_user.orders.includes(:order_items).where(status: :completed).order(created_at: :desc).limit(20)",
    "    render json: { success: true, data: @orders }, status: :ok",
    "  end",
    "  def create",
    "    order = Order.process_checkout!(user: current_user, items: params[:items])",
    "    OrderNotificationJob.perform_later(order.id)",
    "    render json: { success: true, order_id: order.id }, status: :created",
    "  end",
    "end",
  ],
};

/**
 * Procedural infinite word/token generator for programming code
 */
export function generateCodeWords(lang: SupportedCodeLang, count: number = 80): string[] {
  const snippets = SNIPPETS[lang] ?? SNIPPETS.js;
  const resultWords: string[] = [];

  while (resultWords.length < count * 2) {
    const snippet = snippets[Math.floor(Math.random() * snippets.length)];
    const wordsInSnippet = snippet.trim().split(/\s+/).filter(Boolean);
    resultWords.push(...wordsInSnippet);
  }

  return resultWords.slice(0, count);
}
