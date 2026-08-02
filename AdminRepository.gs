<!-- ============================================================
     REPOSITORY
============================================================= -->

<div id="repositoryContainer" class="page-container">

    <!-- ===================================================== -->
    <!-- Header -->
    <!-- ===================================================== -->

    <div class="page-header">

        <div>

            <h1>

                Repository Search

            </h1>

            <p>

                Search archived submissions across all repository files.

            </p>

        </div>

        <div>

            <button
                id="btnRepositoryExportCsv"
                class="secondary-btn"
                type="button"
                disabled>

                Export CSV

            </button>

            <button
                id="btnRepositoryExportExcel"
                class="secondary-btn"
                type="button"
                disabled>

                Export Excel

            </button>

            <button
                id="btnRepositorySearch"
                class="primary-btn">

                Search

            </button>

        </div>

    </div>


    <!-- ===================================================== -->
    <!-- Search Filters -->
    <!-- ===================================================== -->

    <div class="card">

        <div class="card-body">

            <div class="form-grid">

                <div class="form-group">

                    <label>

                        Search By

                    </label>

                    <select
                        id="ddlRepositorySearchType"
                        class="form-control">

                        <option value="submission">

                            Submission ID

                        </option>

                        <option value="order">

                            Order Number

                        </option>

                        <option value="orderHistory">

                            Order Audit History

                        </option>

                        <option value="employee">

                            Employee ID

                        </option>

                        <option value="username">

                            Username

                        </option>

                        <option value="zone">

                            Zone

                        </option>

                        <option value="warehouse">

                            Warehouse

                        </option>

                        <option value="hub">

                            LM Hub

                        </option>

                    </select>

                </div>

                <div class="form-group">

                    <label>

                        Search Value

                    </label>

                    <input
                        type="text"
                        id="txtRepositorySearch"
                        class="form-control"
                        autocomplete="off"
                        placeholder="Enter search value">

                </div>

                <div class="form-group">

                    <label>

                        Submission Date Range

                    </label>

                    <button
                        id="btnRepositoryDateRange"
                        class="form-control repository-date-trigger"
                        type="button">

                        <span id="repositoryDateRangeLabel">All dates</span>

                        <span class="material-symbols-outlined" aria-hidden="true">

                            calendar_month

                        </span>

                    </button>

                </div>

            </div>

        </div>

    </div>


    <!-- ===================================================== -->
    <!-- Search Results -->
    <!-- ===================================================== -->

    <div id="repositoryResultsCard" class="card">

        <div class="card-header">

            Search Results

        </div>

        <div class="card-body">

            <div class="table-responsive">

                <table
                    id="repositoryTable"
                    class="table">

                    <thead>

                        <tr>

                            <th>Submission ID</th>
                            <th>Submitted On</th>
                            <th>Order Number</th>
                            <th>Rider Name</th>
                            <th>Employee ID</th>
                            <th>Zone</th>
                            <th>Warehouse</th>
                            <th>LM Hub</th>
                            <th>Status</th>
                            <th>Reviewed By</th>
                            <th>Reviewed On</th>

                        </tr>

                    </thead>

                    <tbody id="repositoryTableBody">

                        <tr>

                            <td colspan="11">

                                No records found.

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>


    <!-- ===================================================== -->
    <!-- Order Audit History -->
    <!-- ===================================================== -->

    <div id="repositoryAuditCard" class="card hidden">

        <div class="card-header" id="repositoryAuditTitle">

            Order Audit History

        </div>

        <div class="card-body">

            <div class="table-responsive">

                <table id="repositoryAuditTable" class="table">

                    <thead>

                        <tr>

                            <th>Timestamp</th>
                            <th>Submission ID</th>
                            <th>Order Number</th>
                            <th>Action</th>
                            <th>Old Status</th>
                            <th>New Status</th>
                            <th>Performed By</th>
                            <th>Role</th>
                            <th>Remarks</th>

                        </tr>

                    </thead>

                    <tbody id="repositoryAuditTableBody">

                        <tr>

                            <td colspan="9">

                                No audit events found.

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</div>
