const { elasticClient } = require("../config/elastic");

// @desc    Get search analytics
// @route   GET /api/analytics/search
// @access  Private/Superadmin
exports.getSearchAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const gte = `now-${days}d/d`;

    // 1. Top Search Terms
    const topSearchesResult = await elasticClient.search({
      index: "quickcart-logs-*",
      body: {
        size: 0,
        query: {
          bool: {
            must: [
              { term: { "is_search": true } },
              { exists: { field: "keyword" } }
            ],
            filter: [
              { range: { "@timestamp": { gte } } }
            ]
          }
        },
        aggs: {
          popular_keywords: {
            terms: {
              field: "keyword.keyword",
              size: 10
            }
          }
        }
      }
    });

    // 2. Zero Results Rate & Total Searches
    const statsResult = await elasticClient.search({
      index: "quickcart-logs-*",
      body: {
        size: 0,
        query: {
          bool: {
            must: [
              { term: { "is_search": true } }
            ],
            filter: [
              { range: { "@timestamp": { gte } } }
            ]
          }
        },
        aggs: {
          total_searches: { value_count: { field: "is_search" } },
          zero_results: {
            filter: { term: { "results_count": 0 } }
          },
          avg_latency: { avg: { field: "response_time" } }
        }
      }
    });

    // 3. Search Volume Trend (Daily)
    const trendResult = await elasticClient.search({
      index: "quickcart-logs-*",
      body: {
        size: 0,
        query: {
          bool: {
            must: [
                { term: { "is_search": true } }
            ],
            filter: [
              { range: { "@timestamp": { gte } } }
            ]
          }
        },
        aggs: {
          search_over_time: {
            date_histogram: {
              field: "@timestamp",
              calendar_interval: "day"
            }
          }
        }
      }
    });

    // 4. Recent Zero-Result Keywords
    const zeroResultsKeywords = await elasticClient.search({
        index: "quickcart-logs-*",
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                { term: { "is_search": true } },
                { term: { "results_count": 0 } },
                { exists: { field: "keyword" } }
              ],
              filter: [
                { range: { "@timestamp": { gte } } }
              ]
            }
          },
          aggs: {
            top_zero_keywords: {
              terms: {
                field: "keyword.keyword",
                size: 10
              }
            }
          }
        }
      });

    const total = statsResult.aggregations.total_searches.value;
    const zeroCount = statsResult.aggregations.zero_results.doc_count;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSearches: total,
          zeroResultsRate: total > 0 ? ((zeroCount / total) * 100).toFixed(1) : 0,
          avgLatency: statsResult.aggregations.avg_latency.value ? statsResult.aggregations.avg_latency.value.toFixed(0) : 0,
        },
        topKeywords: topSearchesResult.aggregations.popular_keywords.buckets.map(b => ({
          keyword: b.key,
          count: b.doc_count
        })),
        trend: trendResult.aggregations.search_over_time.buckets.map(b => ({
          date: b.key_as_string.split('T')[0],
          count: b.doc_count
        })),
        zeroKeywords: zeroResultsKeywords.aggregations.top_zero_keywords.buckets.map(b => ({
            keyword: b.key,
            count: b.doc_count
        }))
      }
    });

  } catch (error) {
    console.error(`Search Analytics Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error: Could not fetch search analytics'
    });
  }
};
