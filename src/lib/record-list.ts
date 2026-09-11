import { emptyState, rowMatches, parse, effectiveState } from './filters/state';
import type { FilterChangeDetail, FilterDimension, FilterState } from './filters/types';

for (const root of document.querySelectorAll<HTMLElement>('[data-record-list]')) {
  const bar = root.querySelector<HTMLElement>('.filter-bar')!;
  const config = JSON.parse(document.getElementById(`${bar.id}-config`)!.textContent!);
  const dimensions: FilterDimension[] = config.dimensions;
  const input = root.querySelector<HTMLInputElement>('[data-search-input]')!;
  const sort = root.querySelector<HTMLSelectElement>('[data-sort]')!;
  const records = [...root.querySelectorAll<HTMLElement>('[data-record]')];
  const count = root.querySelector<HTMLElement>('[data-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-empty]')!;
  const defaultSort = sort.value;
  const current = () => new URLSearchParams(location.search);
  const readSort = (params: URLSearchParams) => [...sort.options].some(o=>o.value===params.get('sort')) ? params.get('sort')! : defaultSort;
  input.value = current().get('q') ?? ''; sort.value = readSort(current());
  let state: FilterState = effectiveState(parse(current(), dimensions), dimensions);
  function apply(sync = false) {
    const query = input.value.toLocaleLowerCase().trim(); let visible = 0;
    records.forEach(row => {
      const show = (!query || (row.dataset.search ?? '').includes(query)) && rowMatches(row.dataset, state, dimensions);
      row.hidden = !show; if (show) visible++;
    });
    const key = sort.value;
    records.sort((a,b) => key === 'priority' ? Number(a.dataset.priority)-Number(b.dataset.priority) || (a.dataset.name??'').localeCompare(b.dataset.name??'') : key === 'date' ? (b.dataset.date??'').localeCompare(a.dataset.date??'') : (a.dataset.name??'').localeCompare(b.dataset.name??''));
    records.forEach(row => row.parentElement!.appendChild(row));
    count.textContent = `${visible} of ${records.length}`; empty.hidden = visible !== 0;
    if (sync) {
      const url = new URL(location.href);
      if (input.value.trim()) url.searchParams.set('q',input.value.trim()); else url.searchParams.delete('q');
      if (sort.value !== defaultSort) url.searchParams.set('sort',sort.value); else url.searchParams.delete('sort');
      history.replaceState(null,'',url);
    }
  }
  bar.addEventListener('filters:changed', ((event: CustomEvent<FilterChangeDetail>) => { state = event.detail.state; apply(); }) as EventListener);
  // The shared component can initialize before or after this page module.
  const api = (bar as HTMLElement & { __filterBarApi?: { getState(): FilterState } }).__filterBarApi;
  if (api) state = api.getState() ?? emptyState(dimensions);
  input.addEventListener('input', () => apply(true)); sort.addEventListener('change', () => apply(true));
  window.addEventListener('popstate', () => {
    input.value=current().get('q')??''; sort.value=readSort(current());
    state=effectiveState(parse(current(),dimensions),dimensions); apply();
  });
  apply();
}
