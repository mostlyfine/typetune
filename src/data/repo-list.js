export const REPOS = {
  javascript: [
    { owner: 'lodash', repo: 'lodash', branch: 'main', files: ['lodash.js'] },
    { owner: 'expressjs', repo: 'express', branch: 'master', files: ['lib/router/index.js', 'lib/request.js', 'lib/response.js'] },
    { owner: 'facebook', repo: 'react', branch: 'main', files: ['packages/react/src/ReactHooks.js', 'packages/react-dom/src/client/ReactDOMComponent.js'] },
    { owner: 'chartjs', repo: 'Chart.js', branch: 'master', files: ['src/core/core.controller.js', 'src/helpers/helpers.core.js'] },
  ],
  typescript: [
    { owner: 'microsoft', repo: 'TypeScript', branch: 'main', files: ['src/compiler/scanner.ts', 'src/compiler/parser.ts'] },
    { owner: 'vuejs', repo: 'vue', branch: 'main', files: ['packages/reactivity/src/ref.ts', 'packages/runtime-core/src/renderer.ts'] },
    { owner: 'prisma', repo: 'prisma', branch: 'main', files: ['packages/client/src/runtime/core/model/applyModel.ts'] },
  ],
  python: [
    { owner: 'psf', repo: 'requests', branch: 'main', files: ['src/requests/api.py', 'src/requests/models.py'] },
    { owner: 'pallets', repo: 'flask', branch: 'main', files: ['src/flask/app.py', 'src/flask/blueprints.py'] },
    { owner: 'django', repo: 'django', branch: 'main', files: ['django/http/request.py', 'django/db/models/query.py'] },
  ],
  go: [
    { owner: 'gin-gonic', repo: 'gin', branch: 'master', files: ['gin.go', 'context.go', 'routergroup.go'] },
    { owner: 'gofiber', repo: 'fiber', branch: 'main', files: ['app.go', 'ctx.go', 'router.go'] },
    { owner: 'spf13', repo: 'cobra', branch: 'main', files: ['command.go', 'args.go'] },
  ],
  rust: [
    { owner: 'BurntSushi', repo: 'ripgrep', branch: 'master', files: ['crates/core/flags/parse.rs'] },
    { owner: 'tokio-rs', repo: 'tokio', branch: 'master', files: ['tokio/src/runtime/scheduler/multi_thread/worker.rs'] },
    { owner: 'serde-rs', repo: 'serde', branch: 'master', files: ['serde/src/de/mod.rs'] },
  ],
  ruby: [
    { owner: 'rails', repo: 'rails', branch: 'main', files: ['activerecord/lib/active_record/relation/query_methods.rb', 'actionpack/lib/action_controller/metal.rb'] },
    { owner: 'sinatra', repo: 'sinatra', branch: 'main', files: ['lib/sinatra/base.rb'] },
    { owner: 'jekyll', repo: 'jekyll', branch: 'master', files: ['lib/jekyll/site.rb', 'lib/jekyll/document.rb'] },
  ],
  php: [
    { owner: 'laravel', repo: 'framework', branch: 'master', files: ['src/Illuminate/Routing/Router.php', 'src/Illuminate/Database/Eloquent/Model.php', 'src/Illuminate/Http/Request.php'] },
    { owner: 'symfony', repo: 'symfony', branch: 'main', files: ['src/Symfony/Component/HttpFoundation/Request.php', 'src/Symfony/Component/Routing/Router.php'] },
    { owner: 'composer', repo: 'composer', branch: 'main', files: ['src/Composer/Installer.php', 'src/Composer/Factory.php'] },
  ],
  csharp: [
    { owner: 'dotnet', repo: 'runtime', branch: 'main', files: ['src/libraries/System.Text.Json/src/System/Text/Json/JsonSerializer.Read.cs', 'src/libraries/System.Linq/src/System/Linq/Where.cs'] },
    { owner: 'dotnet', repo: 'aspnetcore', branch: 'main', files: ['src/Http/Routing/src/RouteEndpointBuilder.cs', 'src/Mvc/Mvc.Core/src/ControllerBase.cs'] },
    { owner: 'dotnet', repo: 'efcore', branch: 'main', files: ['src/EFCore/DbContext.cs', 'src/EFCore/Query/Internal/QueryCompiler.cs'] },
  ],
};

export const LANGUAGES = Object.keys(REPOS);
